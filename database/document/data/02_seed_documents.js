const dbName = 'kapeh_trace_docs';
const db = db.getSiblingDB(dbName);

print(`Poblando datos de prueba en: ${dbName}...`);

// Limpieza de datos previos
db.fichas_calidad_sca.deleteMany({});
db.expedientes_certificacion.deleteMany({});

// 1. Inserción de Fichas de Catación SCA
db.fichas_calidad_sca.insertMany([
  {
    lote_id: 1,
    codigo_lote: "PERG-2026-01",
    fecha_evaluacion: new Date("2026-11-05T09:00:00Z"),
    catador: {
      nombre: "Roberto Cal y Mayor",
      q_grader_licencia: "Q-88201",
      laboratorio_sede: "Laboratorio SCA Tapachula"
    },
    muestra: {
      humedad_porcentaje: 10.8,
      actividad_agua_aw: 0.54,
      densidad_aparente_gl: 705.0,
      color_grano: "Verde azulado",
      tueste_agtron: 63.0
    },
    puntajes_sca: {
      fragancia_aroma: 8.25,
      sabor: 8.25,
      sabor_residual: 8.00,
      acidez: 8.25,
      cuerpo: 8.25,
      uniformidad: 9.50,
      balance: 8.25,
      taza_limpia: 9.50,
      dulzor: 10.00,
      puntaje_catador: 8.25
    },
    score_total: 86.50,
    notas_cata: ["Chocolate con leche", "Naranja dulce", "Caramelo"],
    conclusion: "Café de Especialidad Excelente"
  },
  {
    lote_id: 2,
    codigo_lote: "PERG-2026-02",
    fecha_evaluacion: new Date("2026-11-06T11:30:00Z"),
    catador: {
      nombre: "Elena Morales Ruiz",
      q_grader_licencia: "Q-94821",
      laboratorio_sede: "Laboratorio Central San Cristóbal"
    },
    muestra: {
      humedad_porcentaje: 11.0,
      actividad_agua_aw: 0.56,
      densidad_aparente_gl: 720.0,
      color_grano: "Verde jade",
      tueste_agtron: 60.0
    },
    puntajes_sca: {
      fragancia_aroma: 8.75,
      sabor: 8.50,
      sabor_residual: 8.25,
      acidez: 8.75,
      cuerpo: 8.00,
      uniformidad: 9.50,
      balance: 8.50,
      taza_limpia: 9.50,
      dulzor: 9.75,
      puntaje_catador: 8.50
    },
    score_total: 88.00,
    notas_cata: ["Jazmín", "Bergamota", "Durazno blanco", "Té negro"],
    conclusion: "Geisha de altura sobresaliente"
  },
  {
    lote_id: 4,
    codigo_lote: "EXP-2026-CH-04",
    fecha_evaluacion: new Date("2026-11-12T15:00:00Z"),
    catador: {
      nombre: "Elena Morales Ruiz",
      q_grader_licencia: "Q-94821",
      laboratorio_sede: "Laboratorio Central San Cristóbal"
    },
    muestra: {
      humedad_porcentaje: 11.2,
      actividad_agua_aw: 0.58,
      densidad_aparente_gl: 712.5,
      color_grano: "Verde intenso",
      tueste_agtron: 62.0
    },
    puntajes_sca: {
      fragancia_aroma: 8.75,
      sabor: 8.50,
      sabor_residual: 8.25,
      acidez: 8.75,
      cuerpo: 8.50,
      uniformidad: 9.50,
      balance: 8.50,
      taza_limpia: 9.50,
      dulzor: 10.00,
      puntaje_catador: 8.75
    },
    score_total: 89.00,
    notas_cata: ["Jazmín intenso", "Mandarina", "Miel de abeja silvestre", "Vainilla"],
    conclusion: "Lote de Exportación Blend Presidencial / Cup of Excellence candidate"
  },
  {
    lote_id: 5,
    codigo_lote: "EXP-2026-CH-05",
    fecha_evaluacion: new Date("2026-11-13T10:00:00Z"),
    catador: {
      nombre: "Roberto Cal y Mayor",
      q_grader_licencia: "Q-88201",
      laboratorio_sede: "Laboratorio SCA Tapachula"
    },
    muestra: {
      humedad_porcentaje: 11.4,
      actividad_agua_aw: 0.59,
      densidad_aparente_gl: 698.0,
      color_grano: "Verde pálido",
      tueste_agtron: 64.0
    },
    puntajes_sca: {
      fragancia_aroma: 7.75,
      sabor: 7.75,
      sabor_residual: 7.50,
      acidez: 7.75,
      cuerpo: 7.75,
      uniformidad: 9.00,
      balance: 7.75,
      taza_limpia: 9.00,
      dulzor: 9.00,
      puntaje_catador: 7.75
    },
    score_total: 81.00,
    notas_cata: ["Nuez", "Chocolate amargo", "Madera"],
    conclusion: "Café de Especialidad estándar (lote posteriormente puesto en cuarentena sanitaria)"
  }
]);

// Nota: el lote 3 (PERG-2026-03) se deja SIN ficha a propósito: su score_calidad_sca es NULL
// (pendiente de catación). Sirve para demostrar el registro de una inspección nueva
// (POST /api/calidad/inspeccion) sin chocar con el índice único de lote_id.

// 2. Inserción de Expedientes de Certificación y Análisis Químico
db.expedientes_certificacion.insertMany([
  {
    lote_id: 4,
    codigo_lote: "EXP-2026-CH-04",
    tipo_certificacion: "ORGANICO_NOP_USDA",
    organismo_emisor: {
      nombre: "Certificadora MayaCert Chiapas S.C.",
      numero_acreditacion: "MC-MX-2026-104",
      auditor_responsable: "Ing. Carlos Gómez Penagos"
    },
    vigencia: {
      fecha_emision: new Date("2026-10-15"),
      fecha_vencimiento: new Date("2027-10-15")
    },
    analisis_laboratorio: {
      laboratorio_acreditado: "Eurofins Agro Ambiental México",
      folio_informe: "INF-LAB-2026-0941",
      fecha_muestreo: new Date("2026-11-10"),
      dictamen_general: "CONFORME",
      parametros_evaluados: [
        {
          analito: "Glifosato y metabolito AMPA",
          limite_maximo_residuo_ppm: 0.05,
          resultado_ppm: 0.00,
          aprobado: true
        },
        {
          analito: "Ocratoxina A (Micotoxinas)",
          limite_maximo_residuo_ppm: 5.0,
          resultado_ppm: 0.15,
          aprobado: true
        },
        {
          analito: "Clorpirifos",
          limite_maximo_residuo_ppm: 0.01,
          resultado_ppm: 0.00,
          aprobado: true
        }
      ]
    }
  },
  {
    lote_id: 5,
    codigo_lote: "EXP-2026-CH-05",
    tipo_certificacion: "INSPECCION_SENASICA",
    organismo_emisor: {
      nombre: "Comité Estatal de Sanidad Vegetal de Chiapas",
      numero_acreditacion: "CESV-CH-2026-088",
      auditor_responsable: "Biol. Fernando Solís"
    },
    analisis_laboratorio: {
      laboratorio_acreditado: "Laboratorio Central de Sanidad Fitoquímica",
      folio_informe: "ALERTA-SAN-2026-004",
      fecha_muestreo: new Date("2026-11-18"),
      dictamen_general: "NO_CONFORME",
      parametros_evaluados: [
        {
          analito: "Glifosato y metabolito AMPA",
          limite_maximo_residuo_ppm: 0.05,
          resultado_ppm: 0.18, // Supera el límite: Detona Cuarentena
          aprobado: false
        }
      ]
    }
  }
]);

print("Datos de prueba de MongoDB insertados exitosamente.");
