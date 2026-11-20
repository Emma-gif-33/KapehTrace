# Entregable 4: Implementación de las Tres Bases de Datos

**Proyecto:** KapehTrace – Sistema Integrado de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad  
**Institución:** Universidad Politécnica de Chiapas  
**Autores:** Equipo de Arquitectura de Persistencia y Backend  

---

## 1. Resumen y Criterio de Aceptación

Para dar estricto cumplimiento al **Criterio de Aceptación del Entregable 4 (Sección 7.4 de la guía UPChiapas)**:
> *«Las tres bases pueden construirse desde cero mediante instrucciones documentadas y generan datos coherentes con el dominio.»*

Se han organizado los artefactos de persistencia en el árbol de directorios estándar:
* **Relacional:** `database/relational/{schema, data, queries}`
* **Documental:** `database/document/{validators, data, queries}`
* **Grafos:** `database/graph/{schema, data, queries}`

---

## 2. Base Relacional: PostgreSQL 16

### 2.1. Definición Física y Restricciones
* **Script:** `database/relational/schema/01_create_tables.sql`
* **Tablas Creadas:**
  1. `productores`: Registro oficial de caficultores con CURP/RFC y región.
  2. `fincas`: Parcelas con altitud geográfica restringida mediante `CHECK (altitud_msnm >= 600 AND altitud_msnm <= 2600)`.
  3. `lotes`: Fuente de verdad de inventario y estado legal. Restringe estados válidos (`DISPONIBLE`, `EN_PROCESO`, `EN_CUARENTENA`, `EMBARCADO`, `LIQUIDADO`, `ERROR_SINCRONIZACION`) y pesos positivos (`CHECK (peso_neto_kg > 0)`).
  4. `clientes`: Compradores internacionales con correo y país destino.
  5. `contratos_venta`: Acuerdos de exportación con control estricto de saldo (`CHECK (saldo_pendiente_usd >= 0)`).
  6. `contrato_lotes`: Asignación M:N de lotes a contratos con clave única compuesta `(contrato_id, lote_id)` para impedir doble asignación redundante.
  7. `pagos_contrato`: Transacciones bancarias SWIFT con referencia bancaria única (`UNIQUE`).

### 2.2. Índices de Rendimiento Justificados
* `idx_lotes_estado`: Optimiza filtros del catálogo comercial ("Lotes disponibles para venta").
* `idx_lotes_score`: Acelera la búsqueda de lotes que cumplen el estándar de especialidad (SCA >= 85 pts).
* `idx_contratos_cliente` y `idx_pagos_contrato`: Agilizan la conciliación de saldos y auditorías contables.

### 2.3. Carga y Verificación
* **Script de Semilla:** `database/relational/data/02_seed_data.sql`
* **Script de Pruebas:** `database/relational/queries/03_verification_queries.sql`
  * Valida balance de contratos y pagos SWIFT.
  * Comprueba que la restricción CHECK rechaza intentos de inserción con peso o sacos negativos.
  * Simula el bloqueo atómico (`UPDATE lotes SET estado = 'EN_CUARENTENA'`) detonado por el backend ante alertas.

---

## 3. Base Documental: MongoDB 7.0

### 3.1. Colecciones y Validación con `$jsonSchema`
* **Script:** `database/document/validators/01_create_collections_validators.js`
* **Colección `fichas_calidad_sca`:**
  * Valida obligatoriedad de los 10 atributos de la Specialty Coffee Association (SCA) entre 0.0 y 10.0 puntos (`fragancia_aroma`, `sabor`, `acidez`, `cuerpo`, `balance`, `taza_limpia`, etc.).
  * Valida que `score_total` sea numérico entre 0.0 y 100.0.
  * Implementa índice único sobre `lote_id` y `codigo_lote` para evitar duplicidad de fichas.
* **Colección `expedientes_certificacion`:**
  * Almacena análisis de laboratorio químico polimórficos (Eurofins, CESV Chiapas).
  * Evalúa analitos variables (Glifosato, Ocratoxina A, Clorpirifos) con límites máximos de residuo (LMR) en ppm y dictamen general `CONFORME` / `NO_CONFORME`.

### 3.2. Carga y Prueba Negativa de Validación
* **Script de Semilla:** `database/document/data/02_seed_documents.js`
* **Script de Pruebas:** `database/document/queries/03_verification_queries.js`
  * Consulta agregada de lotes con notas de cata florales ("Jazmín") y score >= 88.0 pts.
  * **Prueba Negativa de Esquema:** Intenta insertar un documento sin catador y con score 150.0 pts. El validador `$jsonSchema` de MongoDB bloquea la escritura lanzando una excepción de validación de esquema documentada.

---

## 4. Base de Grafos: Neo4j 5.15

### 4.1. Restricciones e Índices Cypher
* **Script:** `database/graph/schema/01_constraints_and_indexes.cypher`
* **Restricciones de Unicidad:**
  * `CONSTRAINT ON (p:Productor) ASSERT p.codigo IS UNIQUE`
  * `CONSTRAINT ON (pa:Parcela) ASSERT pa.codigo IS UNIQUE`
  * `CONSTRAINT ON (le:LoteExportacion) ASSERT le.codigo IS UNIQUE`
  * `CONSTRAINT ON (c:Contenedor) ASSERT c.numero_contenedor IS UNIQUE`
* **Índices de Propiedad:** Índices sobre `id_pg` para búsquedas en tiempo constante $O(1)$ cuando el backend en Node.js consulta el grafo utilizando las claves primarias de PostgreSQL.

### 4.2. Linaje de Custodia y Mezclas (M:N)
* **Script de Semilla:** `database/graph/data/02_seed_graph.cypher`
* **Topología Implementada:**
  * Productores de Jaltenango, Tenejapa y Soconusco.
  * Cosecha y despulpado en Beneficios comunitarios.
  * **Mezcla física M:N:** El lote `EXP-2026-CH-04` se compone de 60% de Pergamino Lavado (Finca El Triunfo) y 40% de Pergamino Honey (Finca Santa Rosa Tacaná), estibado en el contenedor marítimo `MSCU-88491-0` hacia Rotterdam.

### 4.3. Consultas de Validación y Trazabilidad Inversa
* **Script de Pruebas:** `database/graph/queries/03_verification_queries.cypher`
  * **Linaje inverso de extremo a extremo:** Desde el contenedor marítimo hasta las parcelas y agricultores en 1 sola consulta Cypher.
  * **Consulta de Alerta Sanitaria:** Dado un reporte fitosanitario en una parcela, identifica automáticamente todos los lotes de exportación y contenedores contaminados para su bloqueo transaccional.

---

## 5. Guía de Ejecución y Reproducibilidad desde Cero

Para levantar y poblar las tres bases de datos en cualquier máquina con Docker:

### Paso 1: Encender los Contenedores
```bash
docker-compose up -d
```

### Paso 2: Ejecutar Esquema y Semilla Relacional (PostgreSQL)
```bash
# Entrar a PostgreSQL y ejecutar DDL y datos de prueba
docker exec -i kapehtrace-postgres psql -U kapeh_admin -d kapeh_trace_db < database/relational/schema/01_create_tables.sql
docker exec -i kapehtrace-postgres psql -U kapeh_admin -d kapeh_trace_db < database/relational/data/02_seed_data.sql
```

### Paso 3: Ejecutar Validadores y Semilla Documental (MongoDB)
```bash
# Ejecutar scripts en MongoDB vía mongosh
docker exec -i kapehtrace-mongodb mongosh -u kapeh_admin -p kapeh_secret_2026 --authenticationDatabase admin < database/document/validators/01_create_collections_validators.js
docker exec -i kapehtrace-mongodb mongosh -u kapeh_admin -p kapeh_secret_2026 --authenticationDatabase admin < database/document/data/02_seed_documents.js
```

### Paso 4: Ejecutar Restricciones y Semilla de Grafos (Neo4j)
```bash
# Ejecutar scripts en Neo4j vía cypher-shell
docker exec -i kapehtrace-neo4j cypher-shell -u neo4j -p kapeh_secret_2026 < database/graph/schema/01_constraints_and_indexes.cypher
docker exec -i kapehtrace-neo4j cypher-shell -u neo4j -p kapeh_secret_2026 < database/graph/data/02_seed_graph.cypher
```

### Paso 5: Verificación de Resultados
* PostgreSQL: `docker exec -i kapehtrace-postgres psql -U kapeh_admin -d kapeh_trace_db < database/relational/queries/03_verification_queries.sql`
* MongoDB: `docker exec -i kapehtrace-mongodb mongosh -u kapeh_admin -p kapeh_secret_2026 --authenticationDatabase admin < database/document/queries/03_verification_queries.js`
* Neo4j: `docker exec -i kapehtrace-neo4j cypher-shell -u neo4j -p kapeh_secret_2026 < database/graph/queries/03_verification_queries.cypher`
