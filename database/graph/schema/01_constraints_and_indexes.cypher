// 1. Restricciones de Unicidad en Nodos
CREATE CONSTRAINT uq_productor_codigo IF NOT EXISTS
FOR (p:Productor) REQUIRE p.codigo IS UNIQUE;

CREATE CONSTRAINT uq_parcela_codigo IF NOT EXISTS
FOR (pa:Parcela) REQUIRE pa.codigo IS UNIQUE;

CREATE CONSTRAINT uq_lotecereza_codigo IF NOT EXISTS
FOR (lc:LoteCereza) REQUIRE lc.codigo IS UNIQUE;

CREATE CONSTRAINT uq_beneficio_codigo IF NOT EXISTS
FOR (b:Beneficio) REQUIRE b.codigo IS UNIQUE;

CREATE CONSTRAINT uq_lotepergamino_codigo IF NOT EXISTS
FOR (lp:LotePergamino) REQUIRE lp.codigo IS UNIQUE;

CREATE CONSTRAINT uq_loteexportacion_codigo IF NOT EXISTS
FOR (le:LoteExportacion) REQUIRE le.codigo IS UNIQUE;

CREATE CONSTRAINT uq_contenedor_numero IF NOT EXISTS
FOR (c:Contenedor) REQUIRE c.numero_contenedor IS UNIQUE;

// 2. Índices para Búsquedas por ID Relacional de PostgreSQL
CREATE INDEX idx_lotepergamino_idpg IF NOT EXISTS
FOR (lp:LotePergamino) ON (lp.id_pg);

CREATE INDEX idx_loteexportacion_idpg IF NOT EXISTS
FOR (le:LoteExportacion) ON (le.id_pg);

CREATE INDEX idx_productor_idpg IF NOT EXISTS
FOR (p:Productor) ON (p.id_pg);
