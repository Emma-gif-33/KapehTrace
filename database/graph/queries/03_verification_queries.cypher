// 1. Linaje Inverso Completo: Desde el Contenedor hasta los Productores de Origen
MATCH (c:Contenedor {numero_contenedor: 'MSCU-88491-0'})<-[:ESTIBADO_EN]-(le:LoteExportacion)
MATCH path = (le)<-[:MEZCLADO_EN]-(lp:LotePergamino)<-[:TRANSFORMADO_EN]-(lc:LoteCereza)<-[:PRODUJO]-(pa:Parcela)<-[:POSEE]-(prod:Productor)
RETURN 
    c.numero_contenedor AS Contenedor,
    c.puerto_destino AS Destino,
    le.codigo AS LoteExportacion,
    lp.codigo AS LotePergamino,
    lp.proceso AS Proceso,
    pa.nombre AS ParcelaOrigen,
    pa.variedad AS Variedad,
    pa.altitud_msnm AS Altitud,
    prod.nombre AS Productor,
    prod.region AS Region;

// 2. Desglose de Fórmula de Mezcla (Composición Porcentual del Lote de Exportación)
MATCH (lp:LotePergamino)-[m:MEZCLADO_EN]->(le:LoteExportacion {codigo: 'EXP-2026-CH-04'})
RETURN 
    le.codigo AS LoteExportacion,
    le.peso_kg AS PesoTotalExportacion,
    lp.codigo AS LotePergaminoAportante,
    lp.proceso AS Proceso,
    m.proporcion_pct * 100 AS PorcentajeAporte,
    m.kg_aportados AS KilogramosAportados
ORDER BY m.proporcion_pct DESC;

// 3. Consulta de Impacto Sanitario: Dado un problema en Parcela Kolonté,
//    encontrar todos los lotes derivados en cascada (para enviar a cuarentena en Postgres)
MATCH (pa:Parcela {codigo: 'PARC-03'})-[:PRODUJO]->(lc:LoteCereza)-[:TRANSFORMADO_EN]->(lp:LotePergamino)-[:MEZCLADO_EN]->(le:LoteExportacion)
OPTIONAL MATCH (le)-[:ESTIBADO_EN]->(c:Contenedor)
RETURN 
    pa.nombre AS ParcelaProblema,
    lp.codigo AS LotePergaminoAfectado,
    le.id_pg AS IDPostgreSQL_Bloquear,
    le.codigo AS LoteExportacionAfectado,
    c.numero_contenedor AS ContenedorEnRiesgo;

// 4. Verificación de Cardinalidad y Estado General del Grafo
MATCH (n)
RETURN labels(n)[0] AS TipoNodo, count(n) AS TotalNodos
ORDER BY TotalNodos DESC;
