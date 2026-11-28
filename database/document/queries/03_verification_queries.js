const dbName = 'kapeh_trace_docs';
const db = db.getSiblingDB(dbName);

print("=== 1. Consulta de Ficha SCA Completa por Lote ===");
const ficha = db.fichas_calidad_sca.findOne({ codigo_lote: "EXP-2026-CH-04" });
printjson(ficha);

print("\n=== 2. Filtro de Lotes con Notas Florales (regex /Jazmín/i) y Calidad >= 88.0 ===");
const lotesFlorales = db.fichas_calidad_sca.find({
  notas_cata: /Jazm[ií]n/i,   // regex: coincide con "Jazmín" y "Jazmín intenso" (igual que el backend)
  score_total: { $gte: 88.0 }
}, { codigo_lote: 1, score_total: 1, notas_cata: 1, "catador.nombre": 1 }).toArray();
printjson(lotesFlorales);

print("\n=== 3. Detección de Lotes con Dictamen 'NO_CONFORME' en Laboratorio ===");
const noConformes = db.expedientes_certificacion.find({
  "analisis_laboratorio.dictamen_general": "NO_CONFORME"
}, { codigo_lote: 1, tipo_certificacion: 1, "analisis_laboratorio.parametros_evaluados": 1 }).toArray();
printjson(noConformes);

print("\n=== 4. Prueba Negativa: Inserción de Documento Inválido (Debe ser rechazado por $jsonSchema) ===");
try {
  db.fichas_calidad_sca.insertOne({
    lote_id: 999,
    codigo_lote: "INVALID-LOTE",
    // Falta campo obligatorio 'catador' y 'puntajes_sca'
    score_total: 150.0 // Supera el máximo permitido de 100.0
  });
  print("ERROR: El documento inválido fue aceptado.");
} catch (error) {
  print("PRUEBA EXITOSA: MongoDB rechazó el documento inválido mediante la regla $jsonSchema.");
  print(`Mensaje del motor: ${error.message}`);
}
