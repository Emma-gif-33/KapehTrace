-- 1. Consulta Transaccional: Saldo consolidado por cliente y contrato
SELECT 
    c.numero_contrato,
    cl.razon_social AS cliente,
    cl.pais_destino,
    c.total_sacos,
    c.monto_total_usd,
    COALESCE(SUM(p.monto_usd), 0) AS total_pagado_usd,
    c.saldo_pendiente_usd,
    c.estado AS estado_contrato
FROM contratos_venta c
JOIN clientes cl ON c.cliente_id = cl.id
LEFT JOIN pagos_contrato p ON c.id = p.contrato_id AND p.estado = 'CONFIRMADO'
GROUP BY c.id, c.numero_contrato, cl.razon_social, cl.pais_destino, c.total_sacos, c.monto_total_usd, c.saldo_pendiente_usd, c.estado;

-- 2. Consulta de Inventario Físico en Bodegas por Estado
SELECT 
    bodega_ubicacion,
    estado,
    COUNT(*) AS total_lotes,
    SUM(sacos_69kg) AS total_sacos_disponibles,
    SUM(peso_neto_kg) AS peso_total_kg,
    ROUND(AVG(score_calidad_sca), 2) AS promedio_score_sca
FROM lotes
GROUP BY bodega_ubicacion, estado
ORDER BY bodega_ubicacion, estado;

-- 3. Prueba de Restricción CHECK: Intento de insertar un lote con peso negativo (Debe fallar)
DO $$
BEGIN
    INSERT INTO lotes (codigo_lote, tipo_lote, estado, peso_neto_kg, sacos_69kg, bodega_ubicacion, variedad, precio_base_kg_usd)
    VALUES ('FAIL-01', 'PERGAMINO', 'DISPONIBLE', -500.00, -10, 'Bodega Central', 'Geisha', 5.00);
EXCEPTION WHEN check_violation THEN
    RAISE NOTICE 'PRUEBA EXITOSA: La restricción CHECK impidió registrar peso o sacos negativos.';
END $$;

-- 4. Prueba de Bloqueo Transaccional por Cuarentena
-- Simulación de lo que ejecuta el Backend ante alerta sanitaria:
BEGIN;
UPDATE lotes 
SET estado = 'EN_CUARENTENA', updated_at = CURRENT_TIMESTAMP 
WHERE id = 4;

-- Verificación de actualización
SELECT id, codigo_lote, estado, score_calidad_sca, updated_at 
FROM lotes 
WHERE id = 4;
COMMIT;
