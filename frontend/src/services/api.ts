import {
  Lote,
  HealthStatus,
  CreateLotePayload,
  CreateMezclaPayload,
  FichaCalidadPayload,
  AlertaCuarentenaPayload,
  AlertaCuarentenaResponse,
  PasaporteDigital,
  GraphTopology
} from '../types/lotes';

const API_BASE =
  (import.meta as unknown as { env?: Record<string, string> }).env?.VITE_API_URL ||
  'http://localhost:8000';

// Respaldo local alineado con database/relational/data/02_seed_data.sql cuando el backend no está encendido
let FALLBACK_LOTES: Lote[] = [
  {
    id: 1,
    codigo_lote: 'PERG-2026-01',
    tipo_lote: 'PERGAMINO',
    estado: 'LIQUIDADO',
    peso_neto_kg: 10350,
    sacos_69kg: 150,
    bodega_ubicacion: 'Bodega Central Tapachula - Bloque A1',
    score_calidad_sca: 86.5,
    variedad: 'Bourbon',
    precio_base_kg_usd: 5.8
  },
  {
    id: 2,
    codigo_lote: 'PERG-2026-02',
    tipo_lote: 'PERGAMINO',
    estado: 'LIQUIDADO',
    peso_neto_kg: 6900,
    sacos_69kg: 100,
    bodega_ubicacion: 'Bodega Central Tapachula - Bloque A2',
    score_calidad_sca: 88.0,
    variedad: 'Geisha',
    precio_base_kg_usd: 9.5
  },
  {
    id: 3,
    codigo_lote: 'PERG-2026-03',
    tipo_lote: 'PERGAMINO',
    estado: 'DISPONIBLE',
    peso_neto_kg: 13800,
    sacos_69kg: 200,
    bodega_ubicacion: 'Bodega San Cristóbal - Bloque B1',
    score_calidad_sca: 84.75,
    variedad: 'Typica',
    precio_base_kg_usd: 5.2
  },
  {
    id: 4,
    codigo_lote: 'EXP-2026-CH-04',
    tipo_lote: 'EXPORTACION',
    estado: 'DISPONIBLE',
    peso_neto_kg: 17250,
    sacos_69kg: 250,
    bodega_ubicacion: 'Bodega Puerto Chiapas - Muelle 3',
    score_calidad_sca: 89.0,
    variedad: 'Blend Bourbon-Geisha',
    precio_base_kg_usd: 8.2
  },
  {
    id: 5,
    codigo_lote: 'EXP-2026-CH-05',
    tipo_lote: 'EXPORTACION',
    estado: 'EN_CUARENTENA',
    peso_neto_kg: 6900,
    sacos_69kg: 100,
    bodega_ubicacion: 'Bodega Puerto Chiapas - Muelle 2',
    score_calidad_sca: 81.0,
    variedad: 'Mundo Novo',
    precio_base_kg_usd: 4.5
  }
];

async function requestJson<T>(path: string, options?: RequestInit): Promise<T> {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options?.headers || {}) },
    ...options
  });
  const data = await response.json();
  if (!response.ok) {
    const errMsg =
      data?.message ||
      (typeof data?.error === 'string' ? data.error : data?.error?.message) ||
      `Error ${response.status}`;
    throw new Error(errMsg);
  }
  return data as T;
}

export async function checkHealth(): Promise<HealthStatus> {
  try {
    const res = await fetch(`${API_BASE}/health`);
    const data = await res.json();
    return {
      status: data.status || (res.ok ? 'UP' : 'DEGRADED'),
      architecture: data.architecture || 'Políglota (PostgreSQL + MongoDB + Neo4j)',
      databases: {
        postgres: Boolean(data.databases?.postgres),
        mongodb: Boolean(data.databases?.mongodb),
        neo4j: Boolean(data.databases?.neo4j)
      }
    };
  } catch {
    return {
      status: 'OFFLINE',
      architecture: 'Sin conexión al servidor (respaldo local)',
      databases: { postgres: false, mongodb: false, neo4j: false }
    };
  }
}

export async function fetchLotes(filtros?: {
  estado?: string;
  tipo?: string;
  minScore?: number;
}): Promise<{ lotes: Lote[]; online: boolean }> {
  try {
    const params = new URLSearchParams();
    if (filtros?.estado) params.set('estado', filtros.estado);
    if (filtros?.tipo) params.set('tipo', filtros.tipo);
    if (filtros?.minScore !== undefined) params.set('minScore', String(filtros.minScore));
    const query = params.toString() ? `?${params.toString()}` : '';
    const res = await requestJson<{ success: boolean; data: Lote[] }>(`/api/lotes${query}`);
    return { lotes: res.data || [], online: true };
  } catch {
    let filtered = [...FALLBACK_LOTES];
    if (filtros?.estado) filtered = filtered.filter((l) => l.estado === filtros.estado);
    if (filtros?.tipo) filtered = filtered.filter((l) => l.tipo_lote === filtros.tipo);
    if (filtros?.minScore !== undefined) {
      filtered = filtered.filter((l) => (l.score_calidad_sca ?? 0) >= filtros.minScore!);
    }
    return { lotes: filtered, online: false };
  }
}

export async function crearLote(payload: CreateLotePayload): Promise<{ lote: Lote; online: boolean }> {
  try {
    const res = await requestJson<{ success: boolean; data: Lote }>('/api/lotes', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return { lote: res.data, online: true };
  } catch (err) {
    if (err instanceof TypeError) {
      const nuevo: Lote = {
        id: FALLBACK_LOTES.length + 1,
        codigo_lote: payload.codigo_lote,
        tipo_lote: payload.tipo_lote,
        estado: 'DISPONIBLE',
        peso_neto_kg: payload.peso_neto_kg,
        sacos_69kg: Math.floor(payload.peso_neto_kg / 69),
        bodega_ubicacion: payload.bodega_ubicacion,
        score_calidad_sca: null,
        variedad: payload.variedad,
        precio_base_kg_usd: payload.precio_base_kg_usd
      };
      FALLBACK_LOTES = [nuevo, ...FALLBACK_LOTES];
      return { lote: nuevo, online: false };
    }
    throw err;
  }
}

export async function crearMezcla(payload: CreateMezclaPayload): Promise<{
  lote_creado: Lote;
  mensaje: string;
  online: boolean;
}> {
  try {
    const res = await requestJson<{ success: boolean; lote_creado: Lote; mensaje: string }>(
      '/api/lotes/mezcla',
      {
        method: 'POST',
        body: JSON.stringify(payload)
      }
    );
    return { lote_creado: res.lote_creado, mensaje: res.mensaje, online: true };
  } catch (err) {
    if (err instanceof TypeError) {
      const pesoTotal = payload.componentes.reduce((acc, c) => acc + c.kg_aportados, 0);
      const nuevo: Lote = {
        id: FALLBACK_LOTES.length + 1,
        codigo_lote: payload.codigo_exportacion,
        tipo_lote: 'EXPORTACION',
        estado: 'DISPONIBLE',
        peso_neto_kg: pesoTotal,
        sacos_69kg: Math.floor(pesoTotal / 69),
        bodega_ubicacion: payload.bodega_ubicacion,
        score_calidad_sca: null,
        variedad: payload.variedad_blend,
        precio_base_kg_usd: payload.precio_base_kg_usd
      };
      FALLBACK_LOTES = [nuevo, ...FALLBACK_LOTES];
      return {
        lote_creado: nuevo,
        mensaje: 'Mezcla registrada en respaldo local (sin conexión al servidor).',
        online: false
      };
    }
    throw err;
  }
}

export async function obtenerPasaporte(loteId: number): Promise<{
  pasaporte: PasaporteDigital;
  online: boolean;
}> {
  try {
    const res = await requestJson<{ success: boolean; data: PasaporteDigital }>(
      `/api/lotes/${loteId}/pasaporte`
    );
    return { pasaporte: res.data, online: true };
  } catch {
    const lote = FALLBACK_LOTES.find((l) => l.id === loteId) || FALLBACK_LOTES[0];
    return {
      online: false,
      pasaporte: {
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
          contrato_asociado:
            lote.id === 4
              ? {
                  numero_contrato: 'CTR-2026-DE-001',
                  cliente: 'Hanseatic Coffee Roasters GmbH',
                  pais_destino: 'Alemania',
                  estado_contrato: 'VIGENTE'
                }
              : null
        },
        calidad_sensorial: lote.score_calidad_sca
          ? {
              score_total: lote.score_calidad_sca,
              catador: {
                nombre: 'Catador Q-Grader',
                q_grader_licencia: 'Q-2026-MX',
                laboratorio_sede: 'Tapachula / San Cristóbal'
              },
              notas_cata: ['Chocolate amargo', 'Mandarina', 'Panela'],
              puntajes_desglose: {
                fragancia_aroma: 8.5,
                sabor: 8.75,
                sabor_residual: 8.5,
                acidez: 8.75,
                cuerpo: 8.5,
                uniformidad: 10,
                balance: 8.5,
                taza_limpia: 10,
                dulzor: 10,
                puntaje_catador: 8.5
              },
              muestra: {
                humedad_porcentaje: 11.4,
                actividad_agua_aw: 0.56,
                densidad_aparente_gl: 712,
                tueste_agtron: 62
              }
            }
          : null,
        certificaciones_laboratorio: [
          {
            tipo: lote.estado === 'EN_CUARENTENA' ? 'INSPECCION_SENASICA' : 'ORGANICO_USDA',
            organismo: lote.estado === 'EN_CUARENTENA' ? 'SENASICA Inocuidad' : 'MayaCert',
            dictamen: lote.estado === 'EN_CUARENTENA' ? 'NO_CONFORME' : 'CONFORME',
            parametros: [
              {
                analito: lote.estado === 'EN_CUARENTENA' ? 'Ocratoxina A' : 'Glifosato',
                limite_maximo_residuo_ppm: lote.estado === 'EN_CUARENTENA' ? 5.0 : 0.1,
                resultado_ppm: lote.estado === 'EN_CUARENTENA' ? 6.2 : 0.02,
                aprobado: lote.estado !== 'EN_CUARENTENA'
              }
            ]
          }
        ],
        linaje_custodia: [
          {
            productor: 'Productores de Chiapas',
            region: 'Sierra Mariscal / Soconusco',
            parcela: 'Finca El Triunfo Alto',
            variedad: lote.variedad,
            altitud_msnm: 1650,
            lote_pergamino: 'PERG-2026-01',
            proceso_beneficio: 'Lavado',
            proporcion_pct: 60,
            kg_aportados: Math.round(lote.peso_neto_kg * 0.6)
          },
          {
            productor: 'Productores de Chiapas',
            region: 'Soconusco (Unión Juárez)',
            parcela: 'Finca Santa Rosa Tacaná',
            variedad: 'Geisha',
            altitud_msnm: 1780,
            lote_pergamino: 'PERG-2026-02',
            proceso_beneficio: 'Lavado',
            proporcion_pct: 40,
            kg_aportados: Math.round(lote.peso_neto_kg * 0.4)
          }
        ]
      }
    };
  }
}

export async function obtenerGrafoLote(codigoLote: string): Promise<{
  grafo: GraphTopology;
  online: boolean;
}> {
  try {
    const res = await requestJson<{ success: boolean; data: GraphTopology }>(
      `/api/lotes/${encodeURIComponent(codigoLote)}/grafo`
    );
    return { grafo: res.data, online: true };
  } catch {
    return {
      online: false,
      grafo: {
        nodes: [
          { id: 1, label: 'Productor', properties: { nombre: 'Productores Chiapas' } },
          { id: 2, label: 'Parcela', properties: { nombre: 'Finca El Triunfo Alto', altitud_msnm: 1650 } },
          { id: 3, label: 'LotePergamino', properties: { codigo: 'PERG-2026-01' } },
          { id: 4, label: 'LoteExportacion', properties: { codigo: codigoLote } }
        ],
        edges: [
          { from: 1, to: 2, type: 'POSEE', properties: {} },
          { from: 2, to: 3, type: 'TRANSFORMADO_EN', properties: {} },
          { from: 3, to: 4, type: 'MEZCLADO_EN', properties: { proporcion_pct: 0.6 } }
        ]
      }
    };
  }
}

export async function registrarFichaCalidad(payload: FichaCalidadPayload): Promise<{
  score_total: number;
  categoria: string;
  online: boolean;
}> {
  try {
    const res = await requestJson<{
      success: boolean;
      data: { score_total: number; categoria: string };
    }>('/api/calidad/inspeccion', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return {
      score_total: res.data.score_total,
      categoria: res.data.categoria,
      online: true
    };
  } catch (err) {
    if (err instanceof TypeError) {
      const p = payload.puntajes_sca;
      const total =
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
      const rounded = Math.round(total * 100) / 100;
      FALLBACK_LOTES = FALLBACK_LOTES.map((l) =>
        l.id === payload.lote_id ? { ...l, score_calidad_sca: rounded } : l
      );
      return {
        score_total: rounded,
        categoria: rounded >= 85 ? 'Café de Especialidad Excelente' : 'Café Estándar',
        online: false
      };
    }
    throw err;
  }
}

export async function detonarCuarentena(payload: AlertaCuarentenaPayload): Promise<{
  resultado: AlertaCuarentenaResponse;
  online: boolean;
}> {
  try {
    const res = await requestJson<AlertaCuarentenaResponse>('/api/calidad/alerta-cuarentena', {
      method: 'POST',
      body: JSON.stringify(payload)
    });
    return { resultado: res, online: true };
  } catch (err) {
    if (err instanceof TypeError) {
      FALLBACK_LOTES = FALLBACK_LOTES.map((l) =>
        l.codigo_lote === payload.codigo_lote ? { ...l, estado: 'EN_CUARENTENA' } : l
      );
      return {
        online: false,
        resultado: {
          success: true,
          protocolo: 'CUARENTENA_PREVENTIVA_APLICADA',
          expediente_mongo_id: 'local-fallback-exp',
          parcela_origen_sospechosa: 'Parcela en investigación (respaldo local)',
          lotes_bloqueados_count: 1,
          lotes_bloqueados_ids: [],
          codigos_lotes_afectados: [payload.codigo_lote],
          contenedores_en_riesgo: [],
          mensaje: `Lote ${payload.codigo_lote} marcado en cuarentena en respaldo local.`
        }
      };
    }
    throw err;
  }
}
