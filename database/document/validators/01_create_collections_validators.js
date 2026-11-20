const dbName = 'kapeh_trace_docs';
const db = db.getSiblingDB(dbName);

print(`Inicializando colecciones e índices en base de datos: ${dbName}...`);

// 1. Colección: fichas_calidad_sca
db.createCollection("fichas_calidad_sca", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["lote_id", "codigo_lote", "fecha_evaluacion", "catador", "puntajes_sca", "score_total", "notas_cata"],
      properties: {
        lote_id: {
          bsonType: "number",
          description: "ID foráneo lógico que apunta a la tabla lotes en PostgreSQL (Obligatorio)"
        },
        codigo_lote: {
          bsonType: "string",
          description: "Código alfanumérico visible del lote (Obligatorio)"
        },
        fecha_evaluacion: {
          bsonType: "date",
          description: "Fecha y hora en que se ejecutó la sesión de catación"
        },
        catador: {
          bsonType: "object",
          required: ["nombre", "q_grader_licencia"],
          properties: {
            nombre: { bsonType: "string" },
            q_grader_licencia: { bsonType: "string" },
            laboratorio_sede: { bsonType: "string" }
          }
        },
        muestra: {
          bsonType: "object",
          properties: {
            humedad_porcentaje: { bsonType: "number", minimum: 5.0, maximum: 16.0 },
            actividad_agua_aw: { bsonType: "number", minimum: 0.1, maximum: 0.9 },
            densidad_aparente_gl: { bsonType: "number" },
            color_grano: { bsonType: "string" },
            tueste_agtron: { bsonType: "number" }
          }
        },
        puntajes_sca: {
          bsonType: "object",
          required: [
            "fragancia_aroma", "sabor", "sabor_residual", "acidez", "cuerpo",
            "uniformidad", "balance", "taza_limpia", "dulzor", "puntaje_catador"
          ],
          properties: {
            fragancia_aroma: { bsonType: "number", minimum: 0, maximum: 10 },
            sabor: { bsonType: "number", minimum: 0, maximum: 10 },
            sabor_residual: { bsonType: "number", minimum: 0, maximum: 10 },
            acidez: { bsonType: "number", minimum: 0, maximum: 10 },
            cuerpo: { bsonType: "number", minimum: 0, maximum: 10 },
            uniformidad: { bsonType: "number", minimum: 0, maximum: 10 },
            balance: { bsonType: "number", minimum: 0, maximum: 10 },
            taza_limpia: { bsonType: "number", minimum: 0, maximum: 10 },
            dulzor: { bsonType: "number", minimum: 0, maximum: 10 },
            puntaje_catador: { bsonType: "number", minimum: 0, maximum: 10 }
          }
        },
        score_total: {
          bsonType: "number",
          minimum: 0.0,
          maximum: 100.0,
          description: "Suma total de atributos menos penalizaciones por defectos"
        },
        notas_cata: {
          bsonType: "array",
          items: { bsonType: "string" },
          description: "Descriptores aromáticos y de sabor (ej. Jazmín, Mandarina, Miel)"
        },
        conclusion: {
          bsonType: "string"
        }
      }
    }
  }
});

// Índices para fichas_calidad_sca
db.fichas_calidad_sca.createIndex({ lote_id: 1 }, { unique: true });
db.fichas_calidad_sca.createIndex({ codigo_lote: 1 }, { unique: true });
db.fichas_calidad_sca.createIndex({ score_total: -1 });

// 2. Colección: expedientes_certificacion
db.createCollection("expedientes_certificacion", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["lote_id", "codigo_lote", "tipo_certificacion", "organismo_emisor", "analisis_laboratorio"],
      properties: {
        lote_id: { bsonType: "number" },
        codigo_lote: { bsonType: "string" },
        tipo_certificacion: {
          enum: ["ORGANICO_NOP_USDA", "FAIR_TRADE_FLO", "RAINFOREST_ALLIANCE", "INSPECCION_SENASICA"]
        },
        organismo_emisor: {
          bsonType: "object",
          required: ["nombre", "numero_acreditacion"],
          properties: {
            nombre: { bsonType: "string" },
            numero_acreditacion: { bsonType: "string" },
            auditor_responsable: { bsonType: "string" }
          }
        },
        analisis_laboratorio: {
          bsonType: "object",
          required: ["laboratorio_acreditado", "folio_informe", "dictamen_general"],
          properties: {
            laboratorio_acreditado: { bsonType: "string" },
            folio_informe: { bsonType: "string" },
            fecha_muestreo: { bsonType: "date" },
            dictamen_general: { enum: ["CONFORME", "NO_CONFORME"] },
            parametros_evaluados: {
              bsonType: "array",
              items: {
                bsonType: "object",
                required: ["analito", "limite_maximo_residuo_ppm", "resultado_ppm", "aprobado"],
                properties: {
                  analito: { bsonType: "string" },
                  limite_maximo_residuo_ppm: { bsonType: "number" },
                  resultado_ppm: { bsonType: "number" },
                  aprobado: { bsonType: "bool" }
                }
              }
            }
          }
        }
      }
    }
  }
});

// Índices para expedientes_certificacion
db.expedientes_certificacion.createIndex({ lote_id: 1, tipo_certificacion: 1 });
db.expedientes_certificacion.createIndex({ "analisis_laboratorio.dictamen_general": 1 });

print("Colecciones con validación JSON Schema e índices creadas correctamente.");
