/**
 * ==============================================================================
 * KapehTrace - Batería Automatizada de Pruebas de Integración (Entregable 8)
 * Cumple con las 7 Pruebas Obligatorias de la Sección 9 de la Guía UPChiapas
 * ==============================================================================
 * Ejecución: node tests/integration/test_suite_completo.js [URL_BASE]
 */

const BASE_URL = process.argv[2] || process.env.API_URL || 'http://localhost:8000';

const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  cyan: '\x1b[36m',
  bold: '\x1b[1m',
};

function pass(msg) {
  console.log(`${colors.green}  [PASS]${colors.reset} ${msg}`);
}

function fail(msg, err) {
  console.error(`${colors.red}  [FAIL]${colors.reset} ${msg}`);
  if (err) console.error(`    ${colors.yellow}Detalle:${colors.reset}`, err);
}

async function runTestSuite() {
  console.log(`\n${colors.bold}${colors.cyan}======================================================================`);
  console.log(`KapehTrace: Ejecución de Batería de Pruebas de Integración Políglota`);
  console.log(`Endpoint Target: ${BASE_URL}`);
  console.log(`======================================================================${colors.reset}\n`);

  let totalTests = 7;
  let passedTests = 0;

  // --------------------------------------------------------------------------
  // PRUEBA 1: Conectividad y Salud de los Tres Motores
  // --------------------------------------------------------------------------
  console.log(`${colors.bold}1. Prueba de Conectividad (PostgreSQL + MongoDB + Neo4j)${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/health`);
    const data = await res.json();
    if (res.status === 200 && data.databases.postgres && data.databases.mongodb && data.databases.neo4j) {
      pass(`Backend conectado y respondiendo en las 3 bases de datos (HTTP 200).`);
      passedTests++;
    } else {
      fail(`Fallo de conectividad en bases de datos:`, JSON.stringify(data.databases));
    }
  } catch (err) {
    fail(`No se pudo conectar al endpoint /health`, err.message);
  }

  // --------------------------------------------------------------------------
  // PRUEBA 2: Funcional (Catálogo de Lotes e Inventario en Bodega)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}2. Prueba Funcional (Consulta de Lotes Disponibles en PostgreSQL)${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/lotes?estado=DISPONIBLE`);
    const data = await res.json();
    if (res.status === 200 && Array.isArray(data.data) && data.data.length > 0) {
      pass(`Se recuperaron ${data.data.length} lotes disponibles con cálculo exacto de sacos.`);
      passedTests++;
    } else {
      fail(`La consulta funcional no retornó datos válidos.`);
    }
  } catch (err) {
    fail(`Error en petición de catálogo:`, err.message);
  }

  // --------------------------------------------------------------------------
  // PRUEBA 3: Integridad y Restricciones (Rechazo de Entradas Inválidas)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}3. Prueba de Integridad y Validación (Rechazo de Peso Negativo)${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/lotes`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_lote: 'INVALID-01',
        tipo_lote: 'PERGAMINO',
        peso_neto_kg: -250.0, // Inválido: Debe ser > 0
        bodega_ubicacion: 'Bodega Central',
        variedad: 'Bourbon',
        precio_base_kg_usd: 5.0,
      }),
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false) {
      pass(`El validador interceptó el peso negativo y rechazó la petición con HTTP 400.`);
      passedTests++;
    } else {
      fail(`El sistema permitió registrar un lote con peso negativo.`);
    }
  } catch (err) {
    fail(`Error en prueba de integridad:`, err.message);
  }

  // --------------------------------------------------------------------------
  // PRUEBA 4: Integración Políglota (Pasaporte Digital: SQL + Mongo + Neo4j)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}4. Prueba de Integración Multibase (Pasaporte Digital del Lote ID 4)${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/lotes/4/pasaporte`);
    const data = await res.json();
    const p = data.data;

    const hasSql = p && p.comercial && p.comercial.codigo_lote === 'EXP-2026-CH-04';
    const hasMongo = p && p.calidad_sensorial && p.calidad_sensorial.score_total >= 80.0;
    const hasNeo4j = p && Array.isArray(p.linaje_custodia) && p.linaje_custodia.length > 0;

    if (res.status === 200 && hasSql && hasMongo && hasNeo4j) {
      pass(`Pasaporte digital coordinó exitosamente los 3 motores:`);
      console.log(`       - PostgreSQL (Comercial): Lote ${p.comercial.codigo_lote} (${p.comercial.sacos_69kg} sacos)`);
      console.log(`       - MongoDB (Sensorial):    ${p.calidad_sensorial.score_total} pts SCA (${p.calidad_sensorial.notas_cata.join(', ')})`);
      console.log(`       - Neo4j (Trazabilidad):   ${p.linaje_custodia.length} productores de origen identificados`);
      passedTests++;
    } else {
      fail(`El pasaporte digital no contiene datos completos de las 3 bases:`, JSON.stringify(data));
    }
  } catch (err) {
    fail(`Error consultando pasaporte digital:`, err.message);
  }

  // --------------------------------------------------------------------------
  // PRUEBA 5: Consistencia y Validación Saga (Proporciones de Mezcla)
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}5. Prueba de Consistencia (Validación de Proporciones Físicas 100%)${colors.reset}`);
  try {
    // Intento con suma de proporciones = 1.30 (130% - Inválido)
    const res = await fetch(`${BASE_URL}/api/lotes/mezcla`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_exportacion: 'EXP-TEST-FAIL',
        variedad_blend: 'Blend Invalido',
        bodega_ubicacion: 'Bodega Tapachula',
        precio_base_kg_usd: 8.0,
        componentes: [
          { codigo_pergamino: 'PERG-2026-01', proporcion: 0.8, kg_aportados: 13800.0 },
          { codigo_pergamino: 'PERG-2026-02', proporcion: 0.5, kg_aportados: 8625.0 }, // Suma 1.30
        ],
      }),
    });
    const data = await res.json();
    if (res.status === 400 && data.success === false && data.error?.code === 'VALIDATION_ERROR') {
      pass(`El servicio detectó proporciones inconsistentes (HTTP 400 VALIDATION_ERROR)  y evitó crear datos corruptos.`);
      passedTests++;
    } else {
      fail(`Se permitió una mezcla con proporción mayor al 100%.`);
    }
  } catch (err) {
    fail(`Error en prueba de consistencia:`, err.message);
  }

  // --------------------------------------------------------------------------
  // PRUEBA 6: Manejo de Errores y Cuarentena en Cascada
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}6. Prueba de Manejo de Errores y Cuarentena Sanitaria${colors.reset}`);
  try {
    const res = await fetch(`${BASE_URL}/api/calidad/alerta-cuarentena`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        codigo_lote: 'EXP-2026-CH-05',
        analito: 'Glifosato y metabolito AMPA',
        resultado_ppm: 0.18,
        limite_maximo_ppm: 0.05,
        laboratorio: 'Laboratorio de Sanidad Fitoquímica Chiapas',
        motivo_rechazo: 'Exceso crítico de plaguicida detectado en control de exportación',
      }),
    });
    const data = await res.json();
    if (res.status === 200 && data.success && data.protocolo === 'CUARENTENA_PREVENTIVA_APLICADA') {
      pass(`Protocolo de cuarentena ejecutado exitosamente:`);
      console.log(`       - Parcela aislada:   ${data.parcela_origen_sospechosa}`);
      console.log(`       - Lotes bloqueados:  ${data.lotes_bloqueados_count}`);
      passedTests++;
    } else {
      fail(`Fallo en protocolo de cuarentena:`, JSON.stringify(data));
    }
  } catch (err) {
    fail(`Error en ejecución de alerta sanitaria:`, err.message);
  }

  // --------------------------------------------------------------------------
  // PRUEBA 7: Evaluación de Rendimiento y Latencia
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}7. Prueba de Rendimiento (Medición de Latencia en Flujos Prioritarios)${colors.reset}`);
  try {
    const t0 = performance.now();
    const ITERACIONES = 5;
    for (let i = 0; i < ITERACIONES; i++) {
      await fetch(`${BASE_URL}/api/lotes/4/pasaporte`);
    }
    const t1 = performance.now();
    const promedioMs = Math.round((t1 - t0) / ITERACIONES);

    if (promedioMs < 300) {
      pass(`Latencia promedio del Pasaporte Políglota: ${promedioMs} ms (Excelente: < 300 ms).`);
      passedTests++;
    } else {
      fail(`Latencia excesiva: ${promedioMs} ms por consulta integrada.`);
    }
  } catch (err) {
    fail(`Error en prueba de rendimiento:`, err.message);
  }

  // --------------------------------------------------------------------------
  // RESUMEN FINAL
  // --------------------------------------------------------------------------
  console.log(`\n${colors.bold}${colors.cyan}======================================================================`);
  console.log(`Resumen de Resultados: ${passedTests} de ${totalTests} pruebas superadas.`);
  if (passedTests === totalTests) {
    console.log(`${colors.green}TODAS LAS PRUEBAS DE INTEGRACIÓN OBLIGATORIAS PASARON CON ÉXITO.${colors.reset}`);
  } else {
    console.log(`${colors.yellow}Algunas pruebas fallaron. Verifica que los servicios de Docker estén corriendo.${colors.reset}`);
    process.exitCode = 1; // permite que CI / scripts detecten el fallo
  }
  console.log(`${colors.bold}${colors.cyan}======================================================================${colors.reset}\n`);
}

runTestSuite().catch((e) => {
  console.error(e);
  process.exit(1);
});
