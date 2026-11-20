-- Limpieza previa si se reconstruye desde cero
DROP TABLE IF EXISTS pagos_contrato CASCADE;
DROP TABLE IF EXISTS contrato_lotes CASCADE;
DROP TABLE IF EXISTS contratos_venta CASCADE;
DROP TABLE IF EXISTS lotes CASCADE;
DROP TABLE IF EXISTS fincas CASCADE;
DROP TABLE IF EXISTS clientes CASCADE;
DROP TABLE IF EXISTS productores CASCADE;

-- 1. Productores Registrados
CREATE TABLE productores (
    id BIGSERIAL PRIMARY KEY,
    codigo VARCHAR(30) UNIQUE NOT NULL,
    nombre VARCHAR(120) NOT NULL,
    region VARCHAR(80) NOT NULL,
    curp_rfc VARCHAR(20) UNIQUE,
    telefono VARCHAR(20),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 2. Fincas / Parcelas Físicas
CREATE TABLE fincas (
    id BIGSERIAL PRIMARY KEY,
    productor_id BIGINT NOT NULL REFERENCES productores(id) ON DELETE RESTRICT,
    nombre_finca VARCHAR(120) NOT NULL,
    municipio VARCHAR(80) NOT NULL,
    comunidad VARCHAR(80),
    altitud_msnm INTEGER NOT NULL CHECK (altitud_msnm >= 600 AND altitud_msnm <= 2600),
    variedad_predominante VARCHAR(50) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 3. Lotes Físicos (Fuente de Verdad de Inventario y Estado Legal)
CREATE TABLE lotes (
    id BIGSERIAL PRIMARY KEY,
    codigo_lote VARCHAR(50) UNIQUE NOT NULL,
    tipo_lote VARCHAR(25) NOT NULL CHECK (tipo_lote IN ('CEREZA', 'PERGAMINO', 'EXPORTACION')),
    estado VARCHAR(30) NOT NULL DEFAULT 'DISPONIBLE' CHECK (
        estado IN ('DISPONIBLE', 'EN_PROCESO', 'EN_CUARENTENA', 'EMBARCADO', 'LIQUIDADO', 'ERROR_SINCRONIZACION')
    ),
    peso_neto_kg NUMERIC(10,2) NOT NULL CHECK (peso_neto_kg > 0),
    sacos_69kg INTEGER NOT NULL DEFAULT 0 CHECK (sacos_69kg >= 0),
    bodega_ubicacion VARCHAR(100) NOT NULL,
    score_calidad_sca NUMERIC(4,2) DEFAULT NULL CHECK (score_calidad_sca IS NULL OR (score_calidad_sca >= 0 AND score_calidad_sca <= 100)),
    variedad VARCHAR(50) NOT NULL,
    precio_base_kg_usd NUMERIC(8,2) NOT NULL CHECK (precio_base_kg_usd > 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 4. Clientes / Compradores Internacionales
CREATE TABLE clientes (
    id BIGSERIAL PRIMARY KEY,
    codigo_cliente VARCHAR(30) UNIQUE NOT NULL,
    razon_social VARCHAR(150) NOT NULL,
    pais_destino VARCHAR(60) NOT NULL,
    email_contacto VARCHAR(120) NOT NULL,
    telefono VARCHAR(30),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- 5. Contratos de Compraventa Internacional
CREATE TABLE contratos_venta (
    id BIGSERIAL PRIMARY KEY,
    numero_contrato VARCHAR(50) UNIQUE NOT NULL,
    cliente_id BIGINT NOT NULL REFERENCES clientes(id) ON DELETE RESTRICT,
    fecha_firma DATE NOT NULL,
    fecha_entrega_limite DATE NOT NULL,
    total_sacos INTEGER NOT NULL CHECK (total_sacos > 0),
    monto_total_usd NUMERIC(12,2) NOT NULL CHECK (monto_total_usd >= 0),
    saldo_pendiente_usd NUMERIC(12,2) NOT NULL CHECK (saldo_pendiente_usd >= 0),
    estado VARCHAR(25) NOT NULL DEFAULT 'BORRADOR' CHECK (
        estado IN ('BORRADOR', 'VIGENTE', 'CUMPLIDO', 'CANCELADO', 'EN_REVISION')
    ),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT chk_fechas_contrato CHECK (fecha_entrega_limite >= fecha_firma)
);

-- 6. Detalle Contrato - Lotes Asignados (M:N)
CREATE TABLE contrato_lotes (
    id BIGSERIAL PRIMARY KEY,
    contrato_id BIGINT NOT NULL REFERENCES contratos_venta(id) ON DELETE CASCADE,
    lote_id BIGINT NOT NULL REFERENCES lotes(id) ON DELETE RESTRICT,
    sacos_comprometidos INTEGER NOT NULL CHECK (sacos_comprometidos > 0),
    precio_pactado_kg NUMERIC(8,2) NOT NULL CHECK (precio_pactado_kg > 0),
    subtotal_usd NUMERIC(12,2) NOT NULL CHECK (subtotal_usd >= 0),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    CONSTRAINT uq_contrato_lote UNIQUE (contrato_id, lote_id)
);

-- 7. Pagos y Liquidaciones de Contratos
CREATE TABLE pagos_contrato (
    id BIGSERIAL PRIMARY KEY,
    contrato_id BIGINT NOT NULL REFERENCES contratos_venta(id) ON DELETE RESTRICT,
    fecha_pago TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL,
    monto_usd NUMERIC(12,2) NOT NULL CHECK (monto_usd > 0),
    metodo_pago VARCHAR(35) NOT NULL CHECK (metodo_pago IN ('TRANSFERENCIA_SWIFT', 'CARTA_CREDITO', 'DEPOSITO_DIRECTO')),
    referencia_bancaria VARCHAR(100) UNIQUE NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'CONFIRMADO' CHECK (estado IN ('REGISTRADO', 'CONFIRMADO', 'RECHAZADO')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP NOT NULL
);

-- Índices de Rendimiento Justificados
CREATE INDEX idx_lotes_estado ON lotes(estado);
CREATE INDEX idx_lotes_tipo ON lotes(tipo_lote);
CREATE INDEX idx_lotes_score ON lotes(score_calidad_sca);
CREATE INDEX idx_contratos_cliente ON contratos_venta(cliente_id);
CREATE INDEX idx_contrato_lotes_lote ON contrato_lotes(lote_id);
CREATE INDEX idx_pagos_contrato ON pagos_contrato(contrato_id);
