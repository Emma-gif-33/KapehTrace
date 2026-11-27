export type TipoLote = 'CEREZA' | 'PERGAMINO' | 'EXPORTACION';
export type EstadoLote = 'DISPONIBLE' | 'LIQUIDADO' | 'EN_CUARENTENA';

export interface Lote {
  id: number;
  codigo_lote: string;
  tipo_lote: TipoLote | string;
  estado: EstadoLote | string;
  peso_neto_kg: number;
  sacos_69kg: number;
  bodega_ubicacion: string;
  score_calidad_sca: number | null;
  variedad: string;
  precio_base_kg_usd: number;
  created_at?: string;
  updated_at?: string;
}

export interface HealthStatus {
  status: 'UP' | 'DEGRADED' | 'OFFLINE';
  architecture: string;
  databases: {
    postgres: boolean;
    mongodb: boolean;
    neo4j: boolean;
  };
}

export interface CreateLotePayload {
  codigo_lote: string;
  tipo_lote: TipoLote;
  peso_neto_kg: number;
  bodega_ubicacion: string;
  variedad: string;
  precio_base_kg_usd: number;
}

export interface CreateMezclaPayload {
  codigo_exportacion: string;
  variedad_blend: string;
  bodega_ubicacion: string;
  precio_base_kg_usd: number;
  componentes: {
    codigo_pergamino: string;
    proporcion: number;
    kg_aportados: number;
  }[];
}

export interface FichaCalidadPayload {
  lote_id: number;
  codigo_lote: string;
  catador: {
    nombre: string;
    q_grader_licencia: string;
    laboratorio_sede?: string;
  };
  muestra?: {
    humedad_porcentaje: number;
    actividad_agua_aw?: number;
    densidad_aparente_gl?: number;
    color_grano?: string;
    tueste_agtron?: number;
  };
  puntajes_sca: {
    fragancia_aroma: number;
    sabor: number;
    sabor_residual: number;
    acidez: number;
    cuerpo: number;
    uniformidad: number;
    balance: number;
    taza_limpia: number;
    dulzor: number;
    puntaje_catador: number;
  };
  notas_cata: string[];
  conclusion?: string;
}

export interface AlertaCuarentenaPayload {
  codigo_lote: string;
  analito: string;
  resultado_ppm: number;
  limite_maximo_ppm: number;
  laboratorio: string;
  motivo_rechazo: string;
}

export interface AlertaCuarentenaResponse {
  success: boolean;
  protocolo: string;
  expediente_mongo_id: string;
  parcela_origen_sospechosa: string;
  lotes_bloqueados_count: number;
  lotes_bloqueados_ids: number[];
  codigos_lotes_afectados: string[];
  contenedores_en_riesgo: string[];
  mensaje: string;
}

export interface PasaporteDigital {
  comercial: {
    id: number;
    codigo_lote: string;
    tipo_lote: string;
    estado: string;
    peso_neto_kg: number;
    sacos_69kg: number;
    bodega_ubicacion: string;
    variedad: string;
    precio_base_kg_usd: number;
    contrato_asociado: {
      numero_contrato: string;
      cliente: string;
      pais_destino: string;
      estado_contrato: string;
    } | null;
  };
  calidad_sensorial: {
    score_total: number;
    catador: {
      nombre: string;
      q_grader_licencia: string;
      laboratorio_sede?: string;
    };
    notas_cata: string[];
    puntajes_desglose: Record<string, number>;
    muestra?: {
      humedad_porcentaje?: number;
      actividad_agua_aw?: number;
      densidad_aparente_gl?: number;
      tueste_agtron?: number;
    };
    conclusion?: string;
  } | null;
  certificaciones_laboratorio: {
    tipo: string;
    organismo?: string;
    dictamen?: string;
    parametros?: {
      analito: string;
      limite_maximo_residuo_ppm: number;
      resultado_ppm: number;
      aprobado: boolean;
    }[];
  }[];
  linaje_custodia: {
    productor: string;
    region: string;
    parcela: string;
    variedad: string;
    altitud_msnm: number;
    lote_pergamino: string;
    proceso_beneficio: string;
    proporcion_pct: number;
    kg_aportados: number;
  }[];
}

export interface GraphTopology {
  nodes: { id: number; label: string; properties: Record<string, unknown> }[];
  edges: { from: number; to: number; type: string; properties: Record<string, unknown> }[];
}
