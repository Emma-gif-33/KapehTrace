/**
 * ==============================================================================
 * KapehTrace - Pruebas complementarias (validan las correcciones de la v2)
 * ==============================================================================
 * Complementan las 7 pruebas obligatorias de test_suite_completo.js.
 * IMPORTANTE: modifican datos (registran una ficha, una mezcla, una cuarentena).
 *   Ejecutar sobre datos semilla recién cargados; para repetirlas, re-sembrar las bases
 *   (ver database/seed_all.sh / seed_all.ps1).
 * Ejecución: node tests/integration/test_complementarias.js [URL_BASE]
 */
const BASE_URL = process.argv[2] || process.env.API_URL || 'http://localhost:8000';

let ok = 0;
let total = 0;

async function call(method, path, body) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  });
  let data = null;
  try {
    data = await res.json();
  } catch (_) {}
  return { status: res.status, data };
}

function check(nombre, cond, detalle) {
  total++;
  if (cond) {
    ok++;
    console.log(`  [PASS] ${nombre}`);
  } else {
    console.log(`  [FAIL] ${nombre}`);
    if (detalle !== undefined) console.log('    Detalle:', typeof detalle === 'string' ? detalle : JSON.stringify(detalle));
  }
}

const ficha = (lote_id, codigo_lote, extra = {}) => ({
  lote_id,
  codigo_lote,
  catador: { nombre: 'Elena Morales Ruiz', q_grader_licencia: 'Q-94821' },
  puntajes_sca: {
    fragancia_aroma: 8.25, sabor: 8.25, sabor_residual: 8.0, acidez: 8.25, cuerpo: 8.25,
    uniformidad: 10, balance: 8.25, taza_limpia: 10, dulzor: 10, puntaje_catador: 8.25,
  },
  notas_cata: ['Cacao', 'Naranja', 'Panela'],
  ...extra,
});

async function main() {
  console.log(`\n=== Pruebas complementarias KapehTrace (${BASE_URL}) ===\n`);

  console.log('A. Códigos HTTP tipados');
  let r = await call('GET', '/api/lotes/999/pasaporte');
  check('Pasaporte de lote inexistente -> 404 LOTE_NOT_FOUND', r.status === 404 && r.data?.error?.code === 'LOTE_NOT_FOUND', r);
  r = await call('GET', '/api/lotes/abc/pasaporte');
  check('Pasaporte con id no numérico -> 400 VALIDATION_ERROR', r.status === 400 && r.data?.error?.code === 'VALIDATION_ERROR', r);
  r = await call('POST', '/api/lotes', { codigo_lote: 'PERG-2026-01', tipo_lote: 'PERGAMINO', peso_neto_kg: 100, bodega_ubicacion: 'Bodega X', variedad: 'Bourbon', precio_base_kg_usd: 5 });
  check('Código de lote duplicado -> 409 DUPLICATE_RESOURCE', r.status === 409 && r.data?.error?.code === 'DUPLICATE_RESOURCE', r);
  r = await call('POST', '/api/calidad/alerta-cuarentena', { codigo_lote: 'NO-EXISTE-99', analito: 'Glifosato', resultado_ppm: 0.2, limite_maximo_ppm: 0.05, laboratorio: 'Lab Test', motivo_rechazo: 'Prueba de lote inexistente' });
  check('Cuarentena de lote inexistente -> 404 (sin tocar Mongo/Neo4j)', r.status === 404 && r.data?.error?.code === 'LOTE_NOT_FOUND', r);

  console.log('\nB. Mezcla (Saga SQL -> Neo4j)');
  const mezclaBase = { variedad_blend: 'Blend Prueba', bodega_ubicacion: 'Bodega Tapachula', precio_base_kg_usd: 8 };
  r = await call('POST', '/api/lotes/mezcla', { ...mezclaBase, codigo_exportacion: 'EXP-T-FAIL1', componentes: [{ codigo_pergamino: 'PERG-2026-01', proporcion: 0.8, kg_aportados: 800 }, { codigo_pergamino: 'PERG-2026-02', proporcion: 0.5, kg_aportados: 500 }] });
  check('Proporciones que suman 1.30 -> 400 VALIDATION_ERROR', r.status === 400 && r.data?.error?.code === 'VALIDATION_ERROR', r);
  r = await call('POST', '/api/lotes/mezcla', { ...mezclaBase, codigo_exportacion: 'EXP-T-FAIL2', componentes: [{ codigo_pergamino: 'PERG-NO-EXISTE', proporcion: 1, kg_aportados: 500 }] });
  check('Pergamino inexistente -> 404 LOTE_NOT_FOUND (no se escribe nada)', r.status === 404 && r.data?.error?.code === 'LOTE_NOT_FOUND', r);
  r = await call('POST', '/api/lotes/mezcla', { ...mezclaBase, codigo_exportacion: 'EXP-T-FAIL3', componentes: [{ codigo_pergamino: 'EXP-2026-CH-04', proporcion: 1, kg_aportados: 500 }] });
  check('Mezclar un lote que NO es pergamino -> 409 LOTE_NO_APTO_PARA_MEZCLA', r.status === 409 && r.data?.error?.code === 'LOTE_NO_APTO_PARA_MEZCLA', r);

  const stamp = Date.now();
  r = await call('POST', '/api/lotes/mezcla', { ...mezclaBase, codigo_exportacion: `EXP-T-${stamp}`, componentes: [{ codigo_pergamino: 'PERG-2026-01', proporcion: 0.6, kg_aportados: 6000 }, { codigo_pergamino: 'PERG-2026-02', proporcion: 0.4, kg_aportados: 4000 }] });
  check('Mezcla válida 60/40 -> 201 (SQL + Neo4j)', r.status === 201 && r.data?.success === true, r);
  const nuevoId = r.data?.lote_creado?.id;
  if (nuevoId) {
    const g = await call('GET', `/api/lotes/EXP-T-${stamp}/grafo`);
    check('El grafo de la mezcla nueva contiene 2 aristas MEZCLADO_EN', g.data?.data?.edges?.filter((e) => e.type === 'MEZCLADO_EN').length === 2, g.data?.data?.edges);
  }

  // Saga con compensación: pergamino que existe en PostgreSQL pero NO como nodo en Neo4j
  const huerfano = `PERG-HUERFANO-${stamp}`;
  await call('POST', '/api/lotes', { codigo_lote: huerfano, tipo_lote: 'PERGAMINO', peso_neto_kg: 1000, bodega_ubicacion: 'Bodega Prueba', variedad: 'Typica', precio_base_kg_usd: 4 });
  r = await call('POST', '/api/lotes/mezcla', { ...mezclaBase, codigo_exportacion: `EXP-T-SAGA-${stamp}`, componentes: [{ codigo_pergamino: 'PERG-2026-01', proporcion: 0.5, kg_aportados: 500 }, { codigo_pergamino: huerfano, proporcion: 0.5, kg_aportados: 500 }] });
  check('Saga: Neo4j crea 1 de 2 aristas -> 502 GRAPH_WRITE_FAILED', r.status === 502 && r.data?.error?.code === 'GRAPH_WRITE_FAILED', r);
  const lista = await call('GET', '/api/lotes');
  check('Saga: la compensación eliminó el lote de exportación en PostgreSQL', !lista.data?.data?.some((l) => l.codigo_lote === `EXP-T-SAGA-${stamp}`), 'el lote sigue en SQL');

  console.log('\nC. Inspección sensorial (Mongo -> SQL)');
  r = await call('POST', '/api/calidad/inspeccion', ficha(3, 'PERG-2026-03'));
  check('Ficha del lote 3 (sin ficha previa) -> 201, score 87.5', r.status === 201 && r.data?.data?.score_total === 87.5, r);
  const l3 = (await call('GET', '/api/lotes?tipo=PERGAMINO')).data?.data?.find((l) => l.id === 3);
  check('El score se replicó en PostgreSQL (lotes.score_calidad_sca = 87.5)', l3?.score_calidad_sca === 87.5, l3);
  r = await call('POST', '/api/calidad/inspeccion', ficha(3, 'PERG-2026-03'));
  check('Segunda ficha para el mismo lote -> 409 DUPLICATE_RESOURCE', r.status === 409 && r.data?.error?.code === 'DUPLICATE_RESOURCE', r);
  r = await call('POST', '/api/calidad/inspeccion', ficha(3, 'PERG-2026-99'));
  check('Código que no corresponde al lote -> 400 VALIDATION_ERROR', r.status === 400 && r.data?.error?.code === 'VALIDATION_ERROR', r);
  r = await call('POST', '/api/calidad/inspeccion', ficha(777, 'LOTE-FANTASMA'));
  check('Ficha de lote inexistente -> 404 LOTE_NOT_FOUND', r.status === 404 && r.data?.error?.code === 'LOTE_NOT_FOUND', r);

  console.log('\nD. Cuarentena en cascada (Mongo + Neo4j + SQL transaccional)');
  r = await call('POST', '/api/calidad/alerta-cuarentena', { codigo_lote: 'EXP-2026-CH-04', analito: 'Ocratoxina A', resultado_ppm: 9.5, limite_maximo_ppm: 5, laboratorio: 'Eurofins Agro Ambiental México', motivo_rechazo: 'Ocratoxina A por encima del límite europeo' });
  check('Alerta sobre EXP-2026-CH-04 -> 200 CUARENTENA_PREVENTIVA_APLICADA', r.status === 200 && r.data?.protocolo === 'CUARENTENA_PREVENTIVA_APLICADA', r);
  check('Contrato CTR-2026-DE-001 pasó a EN_REVISION', Array.isArray(r.data?.contratos_en_revision) && r.data.contratos_en_revision.includes('CTR-2026-DE-001'), r.data?.contratos_en_revision);
  check('Contenedor MSCU-88491-0 reportado en riesgo', r.data?.contenedores_en_riesgo?.includes('MSCU-88491-0'), r.data?.contenedores_en_riesgo);
  const p4 = await call('GET', '/api/lotes/4/pasaporte');
  check('El pasaporte refleja estado EN_CUARENTENA y contrato EN_REVISION', p4.data?.data?.comercial?.estado === 'EN_CUARENTENA' && p4.data?.data?.comercial?.contrato_asociado?.estado_contrato === 'EN_REVISION', p4.data?.data?.comercial);
  check('El pasaporte incluye el expediente NO_CONFORME de Mongo', p4.data?.data?.certificaciones_laboratorio?.some((c) => c.dictamen === 'NO_CONFORME'), p4.data?.data?.certificaciones_laboratorio);

  console.log(`\nResumen: ${ok} de ${total} verificaciones superadas.`);
  if (ok !== total) process.exitCode = 1;
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
