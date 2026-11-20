-- 1. Inserción de Productores
INSERT INTO productores (codigo, nombre, region, curp_rfc, telefono) VALUES
('PROD-CH-001', 'Mateo Hernández Santiz', 'Sierra Mariscal (Jaltenango)', 'HESM750412HCSNTA01', '+52 961 123 4567'),
('PROD-CH-002', 'Rosalba Pérez Gómez', 'Soconusco (Unión Juárez)', 'PEGR820815MCSMR02', '+52 962 234 5678'),
('PROD-CH-003', 'Gaspar López Méndez', 'Altos de Chiapas (Tenejapa)', 'LOMG690320HCSMP03', '+52 967 345 6789'),
('PROD-CH-004', 'Carmela Morales Cruz', 'Selva Negra (Rayón)', 'MOCC851103MCSLR04', '+52 968 456 7890');

-- 2. Inserción de Fincas
INSERT INTO fincas (productor_id, nombre_finca, municipio, comunidad, altitud_msnm, variedad_predominante) VALUES
(1, 'Finca El Triunfo Alto', 'Ángel Albino Corzo', 'Nueva Palestina', 1650, 'Geisha'),
(1, 'Parcela La Esperanza', 'Ángel Albino Corzo', 'Plan de Ayutla', 1420, 'Typica'),
(2, 'Finca Santa Rosa Tacaná', 'Unión Juárez', 'Talquián', 1780, 'Bourbon'),
(3, 'Parcela Kolonté', 'Tenejapa', 'Matzam', 1550, 'Caturra'),
(4, 'Finca La Neblina', 'Rayón', 'La Selva', 1380, 'Mundo Novo');

-- 3. Inserción de Lotes Físicos (Inventario y Estados)
-- Nota: lote id 4 (EXP-2026-CH-04) representa el lote estelar que vincularemos con Mongo y Neo4j
INSERT INTO lotes (id, codigo_lote, tipo_lote, estado, peso_neto_kg, sacos_69kg, bodega_ubicacion, score_calidad_sca, variedad, precio_base_kg_usd) VALUES
(1, 'PERG-2026-01', 'PERGAMINO', 'LIQUIDADO', 10350.00, 150, 'Bodega Central Tapachula - Bloque A1', 86.50, 'Bourbon', 5.80),
(2, 'PERG-2026-02', 'PERGAMINO', 'LIQUIDADO', 6900.00, 100, 'Bodega Central Tapachula - Bloque A2', 88.00, 'Geisha', 9.50),
(3, 'PERG-2026-03', 'PERGAMINO', 'DISPONIBLE', 13800.00, 200, 'Bodega San Cristóbal - Bloque B1', 84.75, 'Typica', 5.20),
(4, 'EXP-2026-CH-04', 'EXPORTACION', 'DISPONIBLE', 17250.00, 250, 'Bodega Puerto Chiapas - Muelle 3', 89.00, 'Blend Bourbon-Geisha', 8.20),
(5, 'EXP-2026-CH-05', 'EXPORTACION', 'EN_CUARENTENA', 6900.00, 100, 'Bodega Puerto Chiapas - Muelle 2', 81.00, 'Mundo Novo', 4.50);

-- Ajuste de la secuencia de IDs de lotes
SELECT setval('lotes_id_seq', (SELECT MAX(id) FROM lotes));

-- 4. Inserción de Clientes Internacionales
INSERT INTO clientes (codigo_cliente, razon_social, pais_destino, email_contacto, telefono) VALUES
('CLI-EUR-01', 'Hanseatic Coffee Roasters GmbH', 'Alemania', 'purchasing@hanseatic-coffee.de', '+49 40 1234567'),
('CLI-USA-01', 'Pacific Coast Specialty Beans LLC', 'Estados Unidos', 'import@pacificbeans.com', '+1 415 555 0199'),
('CLI-JPN-01', 'Kyoto Artisan Coffee Corp', 'Japón', 'trade@kyoto-artisan.jp', '+81 75 987 6543');

-- 5. Inserción de Contratos de Compraventa
INSERT INTO contratos_venta (numero_contrato, cliente_id, fecha_firma, fecha_entrega_limite, total_sacos, monto_total_usd, saldo_pendiente_usd, estado) VALUES
('CTR-2026-DE-001', 1, '2026-11-01', '2026-12-15', 250, 141450.00, 41450.00, 'VIGENTE'),
('CTR-2026-US-002', 2, '2026-11-10', '2026-12-20', 100, 31050.00, 31050.00, 'BORRADOR');

-- 6. Asignación de Lote a Contrato
INSERT INTO contrato_lotes (contrato_id, lote_id, sacos_comprometidos, precio_pactado_kg, subtotal_usd) VALUES
(1, 4, 250, 8.20, 141450.00);

-- 7. Registro de Pago Inicial (Anticipo SWIFT)
INSERT INTO pagos_contrato (contrato_id, fecha_pago, monto_usd, metodo_pago, referencia_bancaria, estado) VALUES
(1, '2026-11-05 14:30:00-06', 100000.00, 'TRANSFERENCIA_SWIFT', 'SWIFT-DE-20261105-99881', 'CONFIRMADO');
