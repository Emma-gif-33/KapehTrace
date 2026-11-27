import { LotesRelationalRepository } from '../repositories/relational/LotesRelationalRepository.js';
import { CalidadDocumentRepository } from '../repositories/document/CalidadDocumentRepository.js';
import { LinajeGraphRepository } from '../repositories/graph/LinajeGraphRepository.js';
import {
  CreateLoteDTO,
  CreateMezclaDTO,
  FichaCalidadDTO,
  AlertaCuarentenaDTO,
} from '../schemas/lotesSchemas.js';

export class LotesService {
  constructor(
    private relRepo: LotesRelationalRepository = new LotesRelationalRepository(),
    private docRepo: CalidadDocumentRepository = new CalidadDocumentRepository(),
    private graphRepo: LinajeGraphRepository = new LinajeGraphRepository()
  ) {}

  // 1. Listado general de lotes (PostgreSQL)
  async listarLotes(filtros?: { estado?: string; tipo?: string; minScore?: number }) {
    return this.relRepo.findAll(filtros);
  }

  // 2. Consulta Integrada del Pasaporte Digital (SQL + Mongo + Neo4j)
  async obtenerPasaporteDigital(loteId: number) {
    // A. Consultar Base Relacional (Fuente de Verdad Comercial)
    const lote = await this.relRepo.findById(loteId);
    if (!lote) {
      throw new Error(`LOTE_NOT_FOUND: El lote con ID ${loteId} no existe.`);
    }
    const contrato = await this.relRepo.findContratoByLoteId(loteId);

    // B. Consultar Base Documental (Ficha de Calidad y Certificados)
    const fichaCalidad = await this.docRepo.findFichaByLoteId(loteId);
    const expedientesCert = await this.docRepo.findExpedientesByLoteId(loteId);

    // C. Consultar Base de Grafos (Linaje de Origen y Mezclas)
    const linaje = await this.graphRepo.findLinajeByLoteExportacion(lote.codigo_lote);

    // D. Ensamblar respuesta integrada unificada
    return {
      comercial: {
        id: lote.id,
        codigo_lote: lote.codigo_lote,
        tipo_lote: lote.tipo_lote,
        estado: lote.estado,
        peso_neto_kg: lote.peso_neto_kg,
        sacos_69kg: lote.sacos_69kg,
        bodega_ubicacion: lote.bodega_ubicacion,
        variedad: lote.variedad,
        precio_base_kg_usd: lote.precio_base_kg_usd,
        contrato_asociado: contrato,
      },
      calidad_sensorial: fichaCalidad
        ? {
            score_total: fichaCalidad.score_total,
            catador: fichaCalidad.catador,
            notas_cata: fichaCalidad.notas_cata,
            puntajes_desglose: fichaCalidad.puntajes_sca,
            muestra: fichaCalidad.muestra,
            conclusion: fichaCalidad.conclusion,
          }
        : null,
      certificaciones_laboratorio: expedientesCert.map((e) => ({
        tipo: e.tipo_certificacion,
        organismo: e.organismo_emisor?.nombre,
        dictamen: e.analisis_laboratorio?.dictamen_general,
        parametros: e.analisis_laboratorio?.parametros_evaluados,
      })),
      linaje_custodia: linaje,
    };
  }

  // 3. Creación de Lote Simple (PostgreSQL)
  async crearLote(data: CreateLoteDTO) {
    const sacos = Math.floor(data.peso_neto_kg / 69.0);
    return this.relRepo.create(data, sacos);
  }

  // 4. Consolidación de Mezcla de Exportación con Saga Compensatoria (SQL + Neo4j)
  async crearMezclaExportacion(dto: CreateMezclaDTO) {
    // Validar proporciones físicas
    const sumaProporciones = dto.componentes.reduce((acc, c) => acc + c.proporcion, 0);
    if (Math.abs(sumaProporciones - 1.0) > 0.01) {
      throw new Error('VALIDATION_ERROR: La suma de las proporciones de mezcla debe ser igual a 1.0 (100%).');
    }

    const pesoTotalCalculado = dto.componentes.reduce((acc, c) => acc + c.kg_aportados, 0);
    const sacosCalculados = Math.floor(pesoTotalCalculado / 69.0);

    // PASO 1: Escribir en PostgreSQL (Fuente de Verdad)
    let nuevoLoteSQL;
    try {
      nuevoLoteSQL = await this.relRepo.create(
        {
          codigo_lote: dto.codigo_exportacion,
          tipo_lote: 'EXPORTACION',
          peso_neto_kg: pesoTotalCalculado,
          bodega_ubicacion: dto.bodega_ubicacion,
          variedad: dto.variedad_blend,
          precio_base_kg_usd: dto.precio_base_kg_usd,
        },
        sacosCalculados
      );
    } catch (sqlError) {
      throw new Error(`SQL_WRITE_FAILED: ${(sqlError as Error).message}`);
    }

    // PASO 2: Escribir topología en Neo4j
    try {
      await this.graphRepo.createMezclaExportacion(
        nuevoLoteSQL.id,
        dto.codigo_exportacion,
        sacosCalculados,
        pesoTotalCalculado,
        dto.componentes.map((c) => ({
          codigo_pergamino: c.codigo_pergamino,
          proporcion: c.proporcion,
          kg_aportados: c.kg_aportados,
        }))
      );
    } catch (graphError) {
      // COMPENSACIÓN: Si Neo4j falla, revertir PostgreSQL para evitar datos huérfanos
      console.error('⚠️ Fallo en Neo4j. Aplicando compensación en PostgreSQL...');
      await this.relRepo.delete(nuevoLoteSQL.id);
      throw new Error(`GRAPH_WRITE_FAILED: Error registrando mezcla en Neo4j. Operación revertida.`);
    }

    return {
      success: true,
      lote_creado: nuevoLoteSQL,
      mensaje: 'Mezcla consolidada exitosamente en PostgreSQL y Neo4j.',
    };
  }

  // 5. Registro de Ficha Sensorial SCA (MongoDB) + Replicación de Score en PostgreSQL
  async registrarFichaCalidad(dto: FichaCalidadDTO) {
    // Calcular suma de los 10 atributos SCA
    const p = dto.puntajes_sca;
    const scoreTotal =
      p.fragancia_aroma +
      p.sabor +
      p.sabor_residual +
      p.acidez +
      p.cuerpo +
      p.uniformidad +
      p.balance +
      p.taza_limpia +
      p.dulzor +
      p.puntaje_catador;

    const roundedScore = Math.round(scoreTotal * 100) / 100;

    // A. Persistir en MongoDB (Fuente de Verdad de Evaluación Sensorial)
    const docId = await this.docRepo.insertFicha({
      ...dto,
      score_total: roundedScore,
      fecha_evaluacion: new Date(),
    });

    // B. Replicación Controlada en PostgreSQL (Cache de lectura rápida)
    try {
      await this.relRepo.updateScoreSca(dto.lote_id, roundedScore);
    } catch (err) {
      console.warn(`Advertencia al replicar score en PostgreSQL para lote ${dto.lote_id}:`, (err as Error).message);
    }

    return {
      success: true,
      document_id: docId,
      score_total: roundedScore,
      codigo_lote: dto.codigo_lote,
      categoria: roundedScore >= 85.0 ? 'Café de Especialidad Excelente' : 'Café Estándar',
    };
  }

  // 6. Protocolo de Alerta Sanitaria y Cuarentena Preventiva en Cascada (Mongo + Neo4j + SQL)
  async ejecutarProtocoloCuarentena(alerta: AlertaCuarentenaDTO) {
    const lote = await this.relRepo.findByCodigo(alerta.codigo_lote);
    const loteId = lote ? lote.id : 0;

    // A. Registrar expediente técnico de anomalía en MongoDB
    const expedienteId = await this.docRepo.insertExpediente({
      lote_id: loteId,
      codigo_lote: alerta.codigo_lote,
      tipo_certificacion: 'INSPECCION_SENASICA',
      organismo_emisor: {
        nombre: alerta.laboratorio,
        numero_acreditacion: 'LAB-ALERTA-2026',
        auditor_responsable: 'Sistema Automatizado de Vigilancia Epidemiológica',
      },
      vigencia: { fecha_emision: new Date() },
      analisis_laboratorio: {
        laboratorio_acreditado: alerta.laboratorio,
        folio_informe: `ALERTA-${Date.now()}`,
        fecha_muestreo: new Date(),
        dictamen_general: 'NO_CONFORME',
        parametros_evaluados: [
          {
            analito: alerta.analito,
            limite_maximo_residuo_ppm: alerta.limite_maximo_ppm,
            resultado_ppm: alerta.resultado_ppm,
            aprobado: false,
          },
        ],
      },
      motivo_cuarentena: alerta.motivo_rechazo,
    });

    // B. Consultar Neo4j para determinar todo el linaje y contenedores afectados
    const impacto = await this.graphRepo.findImpactoPorLote(alerta.codigo_lote);

    // Asegurar que el lote reportado esté incluido en la lista de IDs a bloquear
    const idsParaBloquear = Array.from(new Set([...impacto.lotes_afectados_ids, ...(loteId ? [loteId] : [])]));

    // C. Bloqueo Transaccional en PostgreSQL
    let lotesBloqueadosCount = 0;
    if (idsParaBloquear.length > 0) {
      lotesBloqueadosCount = await this.relRepo.updateEstadoBatch(idsParaBloquear, 'EN_CUARENTENA');
    }

    return {
      success: true,
      protocolo: 'CUARENTENA_PREVENTIVA_APLICADA',
      expediente_mongo_id: expedienteId,
      parcela_origen_sospechosa: impacto.parcela_origen,
      lotes_bloqueados_count: lotesBloqueadosCount,
      lotes_bloqueados_ids: idsParaBloquear,
      codigos_lotes_afectados: impacto.lotes_afectados_codigos,
      contenedores_en_riesgo: impacto.contenedores_en_riesgo,
      mensaje: `Se bloquearon ${lotesBloqueadosCount} lotes y se emitieron alertas preventivas para contratos y contenedores marítimos.`,
    };
  }

  // 7. Visualización de Topología en Grafo para el Frontend
  async obtenerTopologiaVisual(codigoLote: string) {
    return this.graphRepo.getGraphTopology(codigoLote);
  }
}
