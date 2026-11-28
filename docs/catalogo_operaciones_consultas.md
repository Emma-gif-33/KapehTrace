# Entregable 5: Catálogo de Operaciones y Consultas

**Proyecto:** KapehTrace – Sistema Integrado de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad  
**Institución:** Universidad Politécnica de Chiapas  
**Autores:** Equipo de Arquitectura de Persistencia y Backend  

---

## 1. Estructura y Metodología del Catálogo

En estricto cumplimiento con la **Sección 7.5 de la guía oficial de la UPChiapas**, cada operación se documenta bajo la siguiente ficha técnica estandarizada:
1. **Identificador y Propósito:** Código único y objetivo de negocio.
2. **Base(s) de Datos que Intervienen:** Motor(es) responsable(s).
3. **Parámetros de Entrada y Validaciones:** Tipado y restricciones (Zod / TypeScript).
4. **Sentencia o Consulta Nativa:** SQL, MQL (MongoDB) o Cypher (Neo4j).
5. **Resultado Esperado y Formato de Salida:** Estructura JSON entregada al consumidor.
6. **Casos Normales, Límite y de Error:** Escenarios de prueba exhaustivos.
7. **Evidencia de Ejecución:** Resultado verificado contra las bases de datos.

El catálogo se divide en dos bloques:
* **Parte A:** Operaciones Especializadas por Motor (3 Relacionales, 3 Documentales, 3 de Grafos).
* **Parte B:** Operaciones Integradas Políglotas (Casos de uso coordinados por el Backend Node.js / TypeScript).

---

## 2. Parte A: Operaciones Especializadas por Motor

### 2.1. Operaciones Relacionales (PostgreSQL 16)

#### OP-SQL-01: Alta Transaccional de Lote con Cálculo de Sacos
* **Propósito:** Registrar un nuevo lote físico en bodega como fuente de verdad de inventario, calculando automáticamente los sacos enteros de 69 kg.
* **Base que interviene:** PostgreSQL 16.
* **Parámetros de entrada y validaciones:**
  * `codigo_lote`: string, no vacío, formato `^[A-Z0-9-]+$`.
  * `tipo_lote`: enum ('CEREZA', 'PERGAMINO', 'EXPORTACION').
  * `peso_neto_kg`: float, estrictamente mayor a 0.
  * `bodega_ubicacion`: string, max 100 caracteres.
  * `variedad`: string.
  * `precio_base_kg_usd`: float, mayor a 0.
* **Consulta SQL parametrizada:**
  ```sql
  INSERT INTO lotes (codigo_lote, tipo_lote, estado, peso_neto_kg, sacos_69kg, bodega_ubicacion, variedad, precio_base_kg_usd)
  VALUES ($1, $2, 'DISPONIBLE', $3, FLOOR($3 / 69.0), $4, $5, $6)
  RETURNING id, codigo_lote, tipo_lote, estado, peso_neto_kg, sacos_69kg, bodega_ubicacion;
  ```
* **Resultado esperado (JSON):**
  ```json
  {
    "id": 6,
    "codigo_lote": "PERG-2026-04",
    "tipo_lote": "PERGAMINO",
    "estado": "DISPONIBLE",
    "peso_neto_kg": 6900.0,
    "sacos_69kg": 100,
    "bodega_ubicacion": "Bodega Tapachula - Silo 2"
  }
  ```
* **Casos de prueba:**
  * *Normal:* Peso de 6,900.00 kg genera exactamente 100 sacos.
  * *Límite:* Peso de 68.50 kg genera 0 sacos (menor a un saco estándar) pero el peso queda registrado.
  * *Error:* Intento de registrar `peso_neto_kg = -50.0`. PostgreSQL aborta por infracción de `CHECK (peso_neto_kg > 0)`.

---

#### OP-SQL-02: Creación de Contrato y Asignación de Sacos
* **Propósito:** Formalizar un contrato de venta internacional y comprometer sacos físicos de inventario disponible en una transacción atómica.
* **Base que interviene:** PostgreSQL 16. *(Se ejecuta directamente en `psql`; esta versión no expone endpoint REST para contratos, ver limitaciones.)*
* **Parámetros de entrada:**
  * `numero_contrato`: string único.
  * `cliente_id`: bigint (FK existente).
  * `fecha_entrega_limite`: date (posterior a fecha actual).
  * `lote_id`: bigint.
  * `sacos_comprometidos`: integer, mayor a 0 y menor o igual al inventario del lote.
  * `precio_pactado_kg`: numeric > 0.
* **Consulta SQL (Bloque Transaccional Atómico):**
  ```sql
  BEGIN;
  WITH nuevo AS (
    INSERT INTO contratos_venta (numero_contrato, cliente_id, fecha_firma, fecha_entrega_limite, total_sacos, monto_total_usd, saldo_pendiente_usd, estado)
    VALUES ($1, $2, CURRENT_DATE, $3, $4, ($4 * 69.0 * $5), ($4 * 69.0 * $5), 'VIGENTE')
    RETURNING id
  )
  INSERT INTO contrato_lotes (contrato_id, lote_id, sacos_comprometidos, precio_pactado_kg, subtotal_usd)
  SELECT id, $6, $4, $5, ($4 * 69.0 * $5) FROM nuevo;

  UPDATE lotes SET estado = 'EN_PROCESO' WHERE id = $6;
  COMMIT;
  ```
* **Casos de prueba:**
  * *Normal:* Asignación de 250 sacos disponibles; el contrato queda `VIGENTE` y el lote pasa a `EN_PROCESO`.
  * *Error:* Si el `lote_id` estuviera en estado `EN_CUARENTENA`, la regla de negocio del servicio aborta la transacción antes del COMMIT.

---

#### OP-SQL-03: Conciliación Financiera y Balance de Pagos SWIFT
* **Propósito:** Auditar el estado de cumplimiento contable de cada contrato, cruzando pagos recibidos y deduciendo saldos pendientes.
* **Base que interviene:** PostgreSQL 16.
* **Consulta SQL:**
  ```sql
  SELECT 
      c.numero_contrato,
      cl.razon_social AS cliente,
      c.monto_total_usd,
      COALESCE(SUM(p.monto_usd), 0) AS total_liquidado_usd,
      (c.monto_total_usd - COALESCE(SUM(p.monto_usd), 0)) AS saldo_real_pendiente_usd,
      CASE 
          WHEN COALESCE(SUM(p.monto_usd), 0) >= c.monto_total_usd THEN 'LIQUIDADO'
          WHEN COALESCE(SUM(p.monto_usd), 0) > 0 THEN 'PAGO_PARCIAL'
          ELSE 'PENDIENTE_PAGO'
      END AS estatus_financiero
  FROM contratos_venta c
  JOIN clientes cl ON c.cliente_id = cl.id
  LEFT JOIN pagos_contrato p ON c.id = p.contrato_id AND p.estado = 'CONFIRMADO'
  WHERE c.id = $1
  GROUP BY c.id, c.numero_contrato, cl.razon_social, c.monto_total_usd;
  ```
* **Resultado esperado (JSON):**
  ```json
  {
    "numero_contrato": "CTR-2026-DE-001",
    "cliente": "Hanseatic Coffee Roasters GmbH",
    "monto_total_usd": 141450.00,
    "total_liquidado_usd": 100000.00,
    "saldo_real_pendiente_usd": 41450.00,
    "estatus_financiero": "PAGO_PARCIAL"
  }
  ```

---

### 2.2. Operaciones Documentales (MongoDB 7.0)

#### OP-DOC-01: Registro de Ficha Sensorial SCA
* **Propósito:** Almacenar la evaluación organoléptica completa de 10 atributos de la SCA, descriptores de notas de sabor y datos de tueste con validación `$jsonSchema`.
* **Base que interviene:** MongoDB 7.0 (Colección `fichas_calidad_sca`).
* **Parámetros de entrada y validaciones:**
  * `lote_id`: entero, obligatorio.
  * `codigo_lote`: string, obligatorio.
  * `catador`: objeto con `nombre` y `q_grader_licencia`.
  * `puntajes_sca`: objeto con los 10 atributos numéricos (cada uno entre 0.0 y 10.0).
  * `score_total`: numérico entre 0.0 y 100.0.
  * `notas_cata`: arreglo de strings.
* **Consulta MQL:**
  ```javascript
  db.fichas_calidad_sca.insertOne({
    lote_id: 3,                      // el lote 3 (PERG-2026-03) no tiene ficha en los datos semilla
    codigo_lote: "PERG-2026-03",
    fecha_evaluacion: new Date(),
    catador: {
      nombre: "Elena Morales Ruiz",
      q_grader_licencia: "Q-94821",
      laboratorio_sede: "San Cristóbal"
    },
    muestra: { humedad_porcentaje: 11.2, actividad_agua_aw: 0.58, tueste_agtron: 62.0 },
    puntajes_sca: {
      fragancia_aroma: 8.5, sabor: 8.5, sabor_residual: 8.0, acidez: 8.5,
      cuerpo: 8.5, uniformidad: 10.0, balance: 8.5, taza_limpia: 10.0,
      dulzor: 10.0, puntaje_catador: 8.5
    },
    score_total: 89.0,              // = suma de los 10 atributos (el backend lo calcula así)
    notas_cata: ["Panela", "Cacao"],
    conclusion: "Lote de Alta Especialidad"
  });
  ```
* **Casos de prueba:**
  * *Normal:* Inserta correctamente el documento y retorna el `insertedId`.
  * *Error:* Si se envía `score_total: 105.0` o falta el atributo `acidez`, MongoDB rechaza la operación inmediatamente mediante el validador `$jsonSchema`.

---

#### OP-DOC-02: Búsqueda Polimórfica por Perfil Sensorial y Rango de Calidad
* **Propósito:** Permitir al catador o cliente encontrar lotes que coincidan con notas de cata específicas (ej. "Jazmín") y que superen un umbral de calidad.
* **Base que interviene:** MongoDB 7.0.
* **Consulta MQL:**
  ```javascript
  db.fichas_calidad_sca.find(
    {
      notas_cata: /Jazm[ií]n|Floral/i,   // el backend usa regex insensible a mayúsculas
      score_total: { $gte: 88.0 }
    },
    {
      codigo_lote: 1,
      score_total: 1,
      notas_cata: 1,
      "catador.nombre": 1,
      "muestra.humedad_porcentaje": 1
    }
  ).sort({ score_total: -1 });
  ```
* **Resultado esperado (JSON):**
  ```json
  [
    {
      "codigo_lote": "EXP-2026-CH-04",
      "score_total": 89.0,
      "notas_cata": ["Jazmín intenso", "Mandarina", "Miel de abeja silvestre", "Vainilla"],
      "catador": { "nombre": "Elena Morales Ruiz" },
      "muestra": { "humedad_porcentaje": 11.2 }
    },
    {
      "codigo_lote": "PERG-2026-02",
      "score_total": 88.0,
      "notas_cata": ["Jazmín", "Bergamota", "Durazno blanco", "Té negro"],
      "catador": { "nombre": "Elena Morales Ruiz" },
      "muestra": { "humedad_porcentaje": 11.0 }
    }
  ]
  ```

---

#### OP-DOC-03: Auditoría de Análisis Químico y Detección de No Conformidad
* **Propósito:** Almacenar análisis variables de residuos de pesticidas y consultar lotes que violen los límites máximos de residuos (LMR).
* **Base que interviene:** MongoDB 7.0 (Colección `expedientes_certificacion`).
* **Consulta MQL:**
  ```javascript
  db.expedientes_certificacion.find(
    { "analisis_laboratorio.dictamen_general": "NO_CONFORME" },
    {
      codigo_lote: 1,
      tipo_certificacion: 1,
      "analisis_laboratorio.laboratorio_acreditado": 1,
      "analisis_laboratorio.parametros_evaluados": 1
    }
  );
  ```
* **Resultado esperado (JSON):**
  ```json
  [
    {
      "codigo_lote": "EXP-2026-CH-05",
      "tipo_certificacion": "INSPECCION_SENASICA",
      "analisis_laboratorio": {
        "laboratorio_acreditado": "Laboratorio Central de Sanidad Fitoquímica",
        "parametros_evaluados": [
          {
            "analito": "Glifosato y metabolito AMPA",
            "limite_maximo_residuo_ppm": 0.05,
            "resultado_ppm": 0.18,
            "aprobado": false
          }
        ]
      }
    }
  ]
  ```

---

### 2.3. Operaciones de Grafos (Neo4j 5.15)

#### OP-GRP-01: Registro de Linaje y Topología de Mezcla (M:N)
* **Propósito:** Modelar en el grafo la mezcla física de dos o más lotes pergamino para conformar un lote de exportación homogéneo, asignando ponderación porcentual y peso aportado.
* **Base que interviene:** Neo4j 5.15 (Cypher).
* **Parámetros de entrada:**
  * `id_pg_exportacion`: 4
  * `codigo_exportacion`: "EXP-2026-CH-04"
  * `componentes`: `[{ codigo_pergamino: "PERG-2026-01", proporcion: 0.60, kg: 10350.0 }, { codigo_pergamino: "PERG-2026-02", proporcion: 0.40, kg: 6900.0 }]`
* **Consulta Cypher:**
  ```cypher
  MERGE (le:LoteExportacion {codigo: $codigo_exportacion})
  ON CREATE SET le.id_pg = $id_pg_exportacion, le.fecha_mezcla = date()
  WITH le
  UNWIND $componentes AS comp
  MATCH (lp:LotePergamino {codigo: comp.codigo_pergamino})
  MERGE (lp)-[m:MEZCLADO_EN]->(le)
  SET m.proporcion_pct = comp.proporcion, m.kg_aportados = comp.kg
  RETURN le.codigo AS LoteExportacion, count(m) AS TotalMezclasRegistradas;
  ```
* **Casos de prueba:**
  * *Normal:* Conecta los dos nodos de pergamino existentes con el nodo de exportación.
  * *Error:* Si el código de pergamino no existe, la cláusula `MATCH` falla silenciosamente y `TotalMezclasRegistradas` devuelve 0, alertando al servicio.

---

#### OP-GRP-02: Linaje Inverso Completo (Del Contenedor al Productor)
* **Propósito:** Reconstruir en una sola consulta toda la cadena genealógica de un contenedor que arriba a un puerto internacional.
* **Base que interviene:** Neo4j 5.15.
* **Consulta Cypher:**
  ```cypher
  MATCH (c:Contenedor {numero_contenedor: $num_contenedor})<-[:ESTIBADO_EN]-(le:LoteExportacion)
  MATCH (le)<-[:MEZCLADO_EN]-(lp:LotePergamino)<-[:TRANSFORMADO_EN]-(lc:LoteCereza)<-[:PRODUJO]-(pa:Parcela)<-[:POSEE]-(prod:Productor)
  RETURN 
      c.numero_contenedor AS Contenedor,
      c.puerto_destino AS PuertoDestino,
      le.codigo AS LoteExportacion,
      lp.codigo AS LotePergamino,
      lp.proceso AS ProcesoBeneficio,
      pa.nombre AS Parcela,
      pa.altitud_msnm AS Altitud,
      prod.nombre AS Productor,
      prod.region AS Region;
  ```
* **Resultado esperado (JSON):**
  ```json
  [
    {
      "Contenedor": "MSCU-88491-0",
      "PuertoDestino": "Rotterdam, Países Bajos",
      "LoteExportacion": "EXP-2026-CH-04",
      "LotePergamino": "PERG-2026-01",
      "ProcesoBeneficio": "LAVADO",
      "Parcela": "Finca El Triunfo Alto",
      "Altitud": 1650,
      "Productor": "Mateo Hernández Santiz",
      "Region": "Sierra Mariscal"
    },
    {
      "Contenedor": "MSCU-88491-0",
      "PuertoDestino": "Rotterdam, Países Bajos",
      "LoteExportacion": "EXP-2026-CH-04",
      "LotePergamino": "PERG-2026-02",
      "ProcesoBeneficio": "HONEY",
      "Parcela": "Finca Santa Rosa Tacaná",
      "Altitud": 1780,
      "Productor": "Rosalba Pérez Gómez",
      "Region": "Soconusco"
    }
  ]
  ```

---

#### OP-GRP-03: Detección y Análisis de Impacto Sanitario en Cascada
* **Propósito:** Dada una parcela que presenta un problema fitosanitario, calcular en tiempo real todos los lotes de exportación y contenedores contaminados por mezcla.
* **Base que interviene:** Neo4j 5.15.
* **Consulta Cypher:**
  ```cypher
  MATCH (pa:Parcela {codigo: $codigo_parcela})-[:PRODUJO]->(lc:LoteCereza)-[:TRANSFORMADO_EN]->(lp:LotePergamino)-[:MEZCLADO_EN]->(le:LoteExportacion)
  OPTIONAL MATCH (le)-[:ESTIBADO_EN]->(c:Contenedor)
  RETURN 
      pa.codigo AS ParcelaOrigen,
      pa.nombre AS NombreParcela,
      collect(DISTINCT le.id_pg) AS IDsLotesExportacionAfectados,
      collect(DISTINCT le.codigo) AS CodigosLotesAfectados,
      collect(DISTINCT c.numero_contenedor) AS ContenedoresEnRiesgo;
  ```
* **Resultado esperado (JSON):**
  ```json
  {
    "ParcelaOrigen": "PARC-03",
    "NombreParcela": "Parcela Kolonté",
    "IDsLotesExportacionAfectados": [5],
    "CodigosLotesAfectados": ["EXP-2026-CH-05"],
    "ContenedoresEnRiesgo": []
  }
  ```

---

## 3. Parte B: Operaciones Integradas Políglotas (Backend Orquestador)

Estas operaciones representan la esencia del proyecto integrador: **un único endpoint HTTP que coordina dos o tres bases para resolver un caso de uso del dominio**.

---

### OP-INT-01: Consulta del Pasaporte Digital del Lote de Exportación
* **Propósito:** Entregar a la interfaz de usuario la vista 360° de un lote consolidando inventario y contratos (PostgreSQL), ficha organoléptica (MongoDB) y árbol genealógico de procedencia (Neo4j).
* **Endpoint HTTP:** `GET /api/lotes/:id/pasaporte`
* **Bases coordinadas:** PostgreSQL 16 + MongoDB 7.0 + Neo4j 5.15.
* **Flujo de orquestación en el Servicio Node.js / TypeScript:**
  1. Consulta a PostgreSQL: Obtiene `id`, `codigo_lote`, `estado`, `peso_neto_kg`, `sacos_69kg` y el estado del contrato asociado.
  2. Consulta a MongoDB: Busca en `fichas_calidad_sca` mediante `{ lote_id: id }` para extraer puntajes sensoriales, notas aromáticas y datos del catador.
  3. Consulta a Neo4j: Ejecuta Cypher para obtener los productores, parcelas y beneficios que originaron el café.
  4. Agregación: El servicio ensambla un único DTO tipado y lo retorna con código HTTP 200.
* **Formato de Salida Unificado (JSON):**
  ```json
  {
    "success": true,
    "data": {
      "comercial": {
        "lote_id": 4,
        "codigo_lote": "EXP-2026-CH-04",
        "estado": "DISPONIBLE",
        "sacos_69kg": 250,
        "peso_neto_kg": 17250.0,
        "bodega": "Bodega Puerto Chiapas - Muelle 3",
        "contrato_activo": "CTR-2026-DE-001"
      },
      "calidad_sca": {
        "score_total": 89.0,
        "conclusion": "Lote de Exportación Blend Presidencial",
        "catador": "Elena Morales Ruiz (Q-94821)",
        "notas": ["Jazmín intenso", "Mandarina", "Miel de abeja silvestre"],
        "humedad_porcentaje": 11.2
      },
      "linaje_trazabilidad": [
        {
          "productor": "Mateo Hernández Santiz",
          "parcela": "Finca El Triunfo Alto",
          "variedad": "Geisha",
          "proceso": "LAVADO",
          "aporte_porcentaje": 60.0
        },
        {
          "productor": "Rosalba Pérez Gómez",
          "parcela": "Finca Santa Rosa Tacaná",
          "variedad": "Bourbon",
          "proceso": "HONEY",
          "aporte_porcentaje": 40.0
        }
      ]
    }
  }
  ```

---

### OP-INT-02: Consolidación de Mezcla de Exportación con Saga
* **Propósito:** Registrar la mezcla física de pergaminos para crear un nuevo lote de exportación garantizando consistencia distribuida.
* **Endpoint HTTP:** `POST /api/lotes/mezcla`
* **Bases coordinadas:** PostgreSQL 16 (Fuente de verdad) -> Neo4j 5.15. *(MongoDB no participa: la ficha sensorial se registra aparte con `POST /api/calidad/inspeccion`.)*
* **Flujo con Manejo de Errores y Compensación:**
  0. *Validaciones previas (sin escribir nada):* suma de proporciones = 1.0 ± 0.01 (HTTP 400 `VALIDATION_ERROR`); pergaminos sin repetir; cada pergamino debe existir en PostgreSQL (HTTP 404 `LOTE_NOT_FOUND`), ser de tipo `PERGAMINO` y no estar `EN_CUARENTENA` (HTTP 409 `LOTE_NO_APTO_PARA_MEZCLA`).
  1. *Fase 1 (SQL):* Inserta el lote en PostgreSQL. Si el código ya existe, la restricción `UNIQUE` produce HTTP 409 `DUPLICATE_RESOURCE`.
  2. *Fase 2 (Grafo):* Inserta el nodo y las aristas `:MEZCLADO_EN` en Neo4j y **verifica** que el número de aristas creadas coincida con el de componentes. Si Neo4j falla o crea menos aristas, el servicio elimina los restos del grafo, ejecuta `DELETE` de compensación sobre el lote en PostgreSQL y responde HTTP 502 `GRAPH_WRITE_FAILED`. Si la propia compensación falla, el lote queda en estado `ERROR_SINCRONIZACION` (HTTP 500 `COMPENSATION_FAILED`) para conciliación manual.

---

### OP-INT-03: Protocolo de Alerta Sanitaria y Cuarentena Preventiva en Cascada
* **Propósito:** Ante un resultado de laboratorio adverso en un lote, rastrear la cadena en reversa y poner en cuarentena preventiva todos los lotes relacionados en las 3 bases.
* **Endpoint HTTP:** `POST /api/calidad/alerta-cuarentena`
* **Bases coordinadas:** MongoDB 7.0 -> Neo4j 5.15 -> PostgreSQL 16.
* **Flujo de orquestación:**
  1. *Registro Documental (MongoDB):* Almacena el informe del laboratorio con dictamen `NO_CONFORME` y analito excedido (ej. Glifosato 0.18 ppm).
  2. *Recorrido de Linaje (Neo4j):* Consulta el grafo para determinar qué parcelas produjeron ese grano y qué otros lotes de exportación comparten mezcla con esas parcelas.
  3. *Bloqueo Transaccional (PostgreSQL):* Con la lista de IDs de lotes provista por Neo4j, ejecuta **en una sola transacción** (`BEGIN … COMMIT`, con `ROLLBACK` ante cualquier error):
     ```sql
     UPDATE lotes SET estado = 'EN_CUARENTENA' WHERE id IN ($1, $2, ...);
     UPDATE contratos_venta SET estado = 'EN_REVISION' WHERE id IN (
         SELECT contrato_id FROM contrato_lotes WHERE lote_id IN ($1, $2, ...)
     ) AND estado IN ('VIGENTE', 'BORRADOR');
     ```
     Si falla Neo4j o PostgreSQL, el servicio elimina el expediente `NO_CONFORME` que acababa de insertar en MongoDB (compensación). Si el lote no existe, responde HTTP 404 sin escribir nada.
  4. *Respuesta Unificada:* Retorna a la interfaz gráfica la lista de lotes bloqueados, parcelas bajo sospecha y contratos comerciales suspendidos temporalmente.
