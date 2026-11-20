# Entregable 2: Modelado de Datos y Persistencia Políglota

**Proyecto:** KapehTrace – Sistema Integrado de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad  
**Institución:** Universidad Politécnica de Chiapas  
**Autores:** Equipo de Arquitectura de Persistencia y Backend  

---

## 1. Modelo Conceptual Común del Dominio

El ciclo de vida del café de especialidad en Chiapas abarca desde la recolección del fruto maduro hasta su entrega en puertos internacionales. Cada paradigma de base de datos asume una faceta del mismo dominio:

1. **Fase Agrícola (Fincas y Cosecha):** Los productores cosechan cereza madura en parcelas georreferenciadas con altitudes superiores a 1,200 msnm.
2. **Fase de Beneficiado (Transformación):** La cereza se entrega a un beneficio húmedo donde se despulpa, fermenta y seca, convirtiéndose en café pergamino seco.
3. **Fase de Evaluación Sensorial (Calidad SCA):** Catadores certificados (Q-Graders) evalúan muestras físicas y tazas mediante el protocolo de 10 atributos de la Specialty Coffee Association (SCA), generando un reporte con esquemas flexibles y análisis microbiológicos.
4. **Fase de Mezcla y Consolidación (Linaje M:N):** Múltiples lotes de pergamino con perfiles complementarios se mezclan físicamente en proporciones exactas para estandarizar un lote de exportación (ej. 250 sacos de 69 kg).
5. **Fase Comercial y Logística (Transaccional):** Se firman contratos con compradores extranjeros, se asignan lotes físicos disponibles del inventario en bodega, se registran pagos y se estiban los sacos en contenedores marítimos para exportación.

```
       [ PRODUCTOR / PARCELA ]
                  │
                  ▼ (Cosecha)
           [ LOTE CEREZA ]
                  │
                  ▼ (Beneficiado: Lavado / Honey / Natural)
         [ LOTE PERGAMINO ] ────────┐
                  │ (Inspección)    │
                  ▼                 ▼ (Consolidación / Mezcla M:N)
      { FICHA CALIDAD SCA }   [ LOTE EXPORTACIÓN ]
      { EXPEDIENTE LAB    }         │
      (Documental: Mongo)           ▼ (Venta y Asignación de Stock)
                             [ CONTRATO DE VENTA ] ───► [ PAGOS ]
                             (Relacional: PostgreSQL)
                                    │
                                    ▼ (Embarque)
                              [ CONTENEDOR ]
                          (Grafo Linaje: Neo4j)
```

---

## 2. Modelo Lógico Relacional (PostgreSQL 16)

El modelo relacional gobierna la integridad transaccional, el estado legal de los lotes, el control de inventario físico en bodega y la relación contractual-financiera con los clientes.

### 2.1. Diagrama de Tablas y Cardinalidades

```
+------------------+         1:N         +--------------------+
|   productores    |-------------------->|       fincas       |
+------------------+                     +--------------------+
| PK id            |                     | PK id              |
|    codigo        |                     | FK productor_id    |
|    nombre        |                     |    nombre_finca    |
|    region        |                     |    municipio       |
|    curp_rfc      |                     |    altitud_msnm    |
+------------------+                     +--------------------+
         │
         │ 1:N
         ▼
+-------------------------------------------------------------+
|                            lotes                            |
+-------------------------------------------------------------+
| PK id                   BIGSERIAL                           |
|    codigo_lote          VARCHAR(50) UNIQUE NOT NULL         |
|    tipo_lote            VARCHAR(20) NOT NULL                | -- CEREZA, PERGAMINO, EXPORTACION
|    estado               VARCHAR(25) NOT NULL DEFAULT 'DISP' | -- DISPONIBLE, EN_PROCESO, EN_CUARENTENA, EMBARCADO, LIQUIDADO
|    peso_neto_kg         NUMERIC(10,2) NOT NULL CHECK (> 0)  |
|    sacos_69kg           INTEGER NOT NULL DEFAULT 0          |
|    bodega_ubicacion     VARCHAR(100)                        |
|    score_calidad_sca    NUMERIC(4,2) DEFAULT NULL           | -- Cache de lectura proveniente de Mongo
|    variedad_predomin    VARCHAR(50) NOT NULL                | -- Bourbon, Typica, Geisha, Caturra
|    precio_base_kg_usd   NUMERIC(8,2) NOT NULL CHECK (> 0)   |
|    created_at           TIMESTAMP NOT NULL DEFAULT NOW()    |
|    updated_at           TIMESTAMP NOT NULL DEFAULT NOW()    |
+-------------------------------------------------------------+
         │                                       ▲
         │ 1:N                                   │ 1:N
         ▼                                       │
+-------------------------+             +-------------------------+
|     contrato_lotes      |             |        clientes         |
+-------------------------+             +-------------------------+
| PK id                   |             | PK id                   |
| FK contrato_id          |             |    codigo_cliente       |
| FK lote_id              |             |    razon_social         |
|    sacos_comprometidos  |             |    pais_destino         |
|    precio_pactado_kg    |             |    email_contacto       |
|    subtotal_usd         |             +-------------------------+
+-------------------------+                          │
         ▲                                           │ 1:N
         │ N:1                                       ▼
+-------------------------------------------------------------+
|                       contratos_venta                       |
+-------------------------------------------------------------+
| PK id                   BIGSERIAL                           |
|    numero_contrato      VARCHAR(50) UNIQUE NOT NULL         |
| FK cliente_id           BIGINT NOT NULL REFERENCES clientes |
|    fecha_firma          DATE NOT NULL                       |
|    fecha_entrega_limite DATE NOT NULL                       |
|    total_sacos          INTEGER NOT NULL CHECK (> 0)        |
|    monto_total_usd      NUMERIC(12,2) NOT NULL CHECK (>= 0) |
|    saldo_pendiente_usd  NUMERIC(12,2) NOT NULL CHECK (>= 0) |
|    estado               VARCHAR(20) NOT NULL DEFAULT 'BORR' | -- BORRADOR, VIGENTE, CUMPLIDO, CANCELADO
+-------------------------------------------------------------+
                                │
                                │ 1:N
                                ▼
+-------------------------------------------------------------+
|                        pagos_contrato                       |
+-------------------------------------------------------------+
| PK id                   BIGSERIAL                           |
| FK contrato_id          BIGINT NOT NULL REFERENCES contrato |
|    fecha_pago           TIMESTAMP NOT NULL DEFAULT NOW()    |
|    monto_usd            NUMERIC(10,2) NOT NULL CHECK (> 0)  |
|    metodo_pago          VARCHAR(30) NOT NULL                | -- TRANSFERENCIA_SWIFT, CARTA_CREDITO
|    referencia_bancaria  VARCHAR(100) UNIQUE NOT NULL        |
|    estado               VARCHAR(20) NOT NULL DEFAULT 'CONF' | -- REGISTRADO, CONFIRMADO, RECHAZADO
+-------------------------------------------------------------+
```

### 2.2. Restricciones e Integridad del Modelo Relacional
* **Restricción de Estado de Lote:** Un lote en estado `EN_CUARENTENA` no puede ser asignado en `contrato_lotes` (validado mediante trigger / regla de negocio en servicio).
* **Integridad de Existencia:** `sacos_69kg` se calcula como `FLOOR(peso_neto_kg / 69.0)`.
* **Consistencia Contable:** `saldo_pendiente_usd` en `contratos_venta` se deduce con cada fila insertada en `pagos_contrato`.

---

## 3. Modelo Documental (MongoDB 7)

MongoDB almacena información con estructura polimórfica y anidada: las fichas de catación bajo el estándar internacional SCA y los expedientes técnicos de laboratorios con parámetros químicos variables.

### 3.1. Colección 1: `fichas_calidad_sca`
Almacena la evaluación sensorial cuantitativa y cualitativa. Cada atributo recibe una calificación de 0 a 10 y se desglosan descriptores sensoriales y defectos físicos.

```json
{
  "_id": { "$oid": "655f102a9b1d8e001234abcd" },
  "lote_id": 104,
  "codigo_lote": "EXP-2026-CH-04",
  "fecha_evaluacion": "2026-11-15T10:30:00Z",
  "catador": {
    "nombre": "Elena Morales Ruiz",
    "q_grader_licencia": "Q-94821",
    "laboratorio_sede": "Laboratorio Central San Cristóbal"
  },
  "muestra": {
    "humedad_porcentaje": 11.2,
    "actividad_agua_aw": 0.58,
    "densidad_aparente_gl": 710.5,
    "color_grano": "Verde azulado",
    "tueste_agtron": 62.5
  },
  "puntajes_sca": {
    "fragancia_aroma": 8.75,
    "sabor": 8.50,
    "sabor_residual": 8.25,
    "acidez": 8.75,
    "cuerpo": 8.50,
    "uniformidad": 10.00,
    "balance": 8.50,
    "taza_limpia": 10.00,
    "dulzor": 10.00,
    "puntaje_catador": 8.75
  },
  "defectos": [
    {
      "tipo": "Grano negro parcial",
      "intensidad": 2,
      "tazas_afectadas": 0,
      "penalizacion_puntos": 0.0
    }
  ],
  "score_total": 89.00,
  "notas_cata": ["Jazmín", "Mandarina dulce", "Miel de azahar", "Chocolate blanco"],
  "conclusion": "Café de Especialidad Presidencial / Lote Elegible Cup of Excellence"
}
```

* **Regla de Validación (JSON Schema):**
  * `score_total` debe ser numérico entre 0.0 y 100.0.
  * `lote_id` obligatorio y de tipo entero (índice único para garantizar 1 ficha por lote).
  * Los 10 atributos de `puntajes_sca` son obligatorios y acotados entre 0 y 10.

### 3.2. Colección 2: `expedientes_certificacion`
Almacena certificados emitidos por diversas entidades (Fair Trade, USDA Organic, Ceres, Senasica). Los análisis químicos varían en función del destino (la Unión Europea evalúa límites de Glifosato y Ocratoxina A, mientras Japón mide Clorpirifos).

```json
{
  "_id": { "$oid": "655f102a9b1d8e005678ef01" },
  "lote_id": 104,
  "codigo_lote": "EXP-2026-CH-04",
  "tipo_certificacion": "ORGANICO_NOP_USDA",
  "organismo_emisor": {
    "nombre": "Certificadora MayaCert S.A.",
    "numero_acreditacion": "MC-2026-88",
    "auditor_responsable": "Ing. Carlos Gómez"
  },
  "vigencia": {
    "fecha_emision": "2026-10-01",
    "fecha_vencimiento": "2027-10-01"
  },
  "analisis_laboratorio": {
    "laboratorio_acreditado": "Eurofins Agro México",
    "folio_informe": "LAB-EU-2026-9041",
    "fecha_muestreo": "2026-11-12",
    "dictamen_general": "CONFORME",
    "parametros_evaluados": [
      {
        "analito": "Glifosato",
        "limite_deteccion_ppm": 0.01,
        "limite_maximo_residuo_ppm": 0.05,
        "resultado_ppm": 0.00,
        "aprobado": true
      },
      {
        "analito": "Ocratoxina A (Micotoxinas)",
        "limite_deteccion_ppm": 0.5,
        "limite_maximo_residuo_ppm": 5.0,
        "resultado_ppm": 0.2,
        "aprobado": true
      }
    ]
  },
  "auditoria_campo": {
    "inspeccion_parcelaria_aprobada": true,
    "barreras_vivas_presentes": true,
    "uso_abonos_sinteticos_detectado": false,
    "observaciones": "Parcela cumple con manejo agroecológico bajo sombra de chalahuite."
  }
}
```

---

## 4. Modelo de Grafo (Neo4j 5)

El modelo de grafos resuelve el problema de la **trazabilidad profunda y el linaje de mezclas**. Permite recorrer en milisegundos toda la historia de transformación desde la parcela hasta el contenedor de exportación.

### 4.1. Nodos y Etiquetas (Labels)

| Etiqueta | Propiedades Clave | Descripción |
| :--- | :--- | :--- |
| `:Productor` | `id_pg` (int), `codigo` (string), `nombre` (string), `region` (string) | Agricultor registrado. |
| `:Parcela` | `codigo` (string, UK), `nombre` (string), `variedad` (string), `altitud` (int) | Terreno donde se cultiva el café. |
| `:LoteCereza` | `id_pg` (int), `codigo` (string, UK), `peso_kg` (float), `fecha_cosecha` (date) | Fruto recién cortado. |
| `:Beneficio` | `codigo` (string, UK), `nombre` (string), `tipo` ("HUMEDO" \| "SECO") | Planta de despulpado o secado. |
| `:LotePergamino` | `id_pg` (int), `codigo` (string, UK), `peso_kg` (float), `proceso` ("LAVADO" \| "HONEY" \| "NATURAL") | Café despulpado y secado en pergamino. |
| `:LoteExportacion` | `id_pg` (int), `codigo` (string, UK), `peso_kg` (float), `sacos` (int) | Lote homogéneo listo para exportar. |
| `:Contenedor` | `numero_contenedor` (string, UK), `naviera` (string), `puerto_destino` (string) | Contenedor marítimo de embarque. |

### 4.2. Relaciones, Dirección y Cardinalidades

```
(:Productor)-[:POSEE]->(:Parcela)                                  [1 a N]
(:Parcela)-[:PRODUJO]->(:LoteCereza)                               [1 a N]
(:LoteCereza)-[:PROCESADO_EN {fecha, metodo}]->(:Beneficio)        [N a 1]
(:LoteCereza)-[:TRANSFORMADO_EN {rendimiento_pct}]->(:LotePergamino) [N a 1]
(:LotePergamino)-[:MEZCLADO_EN {proporcion_pct, kg_aportados}]->(:LoteExportacion) [M a N]
(:LoteExportacion)-[:ESTIBADO_EN {fecha_estiba, sellos}]->(:Contenedor) [N a 1]
```

### 4.3. Diagrama Visual del Grafo de Linaje

```
  (:Productor)-[:POSEE]->(:Parcela)
                            │
                            ▼ [:PRODUJO]
                      (:LoteCereza)
                            │
                            ▼ [:TRANSFORMADO_EN]
                     (:LotePergamino) ──┐
                            │           │ [:MEZCLADO_EN]
                            ▼           ▼
                   (:LoteExportacion "EXP-04")
                            │
                            ▼ [:ESTIBADO_EN]
                     (:Contenedor "MSCU-88491")
```

### 4.4. Reglas de Grafo y Consultas de Patrón Clave
* **Restricción de Unicidad:** `CREATE CONSTRAINT FOR (l:LoteExportacion) REQUIRE l.codigo IS UNIQUE;`
* **Consulta de Linaje Inverso (Impacto Epidemiológico / Sanitario):**
  Dado un contenedor contaminado, descubre en 1 sola consulta todas las parcelas que aportaron granos a la mezcla:
  ```cypher
  MATCH (c:Contenedor {numero_contenedor: $num_contenedor})<-[:ESTIBADO_EN]-(le:LoteExportacion)
  MATCH path = (le)<-[:MEZCLADO_EN*1..2]-(lp:LotePergamino)<-[:TRANSFORMADO_EN]-(lc:LoteCereza)<-[:PRODUJO]-(p:Parcela)<-[:POSEE]-(prod:Productor)
  RETURN prod.nombre AS Productor, p.nombre AS Parcela, p.variedad AS Variedad, lc.codigo AS LoteOrigen;
  ```

---

## 5. Diccionario de Datos y Reglas de Coherencia Cruzada

Para garantizar que los tres modelos representen el mismo dominio sin contradicciones:

| Campo Lógico Maestro | PostgreSQL (Relacional) | MongoDB (Documental) | Neo4j (Grafo) | Regla de Sincronización y Propagación |
| :--- | :--- | :--- | :--- | :--- |
| **Identificador del Lote** | `lotes.id` (PK Bigserial) | `lote_id` (NumberLong, Indexed) | `id_pg` (Integer property) | Se genera en PostgreSQL al crear el lote y se propaga como puntero lógico a Mongo y Neo4j. |
| **Código del Lote** | `codigo_lote` (VARCHAR UNIQUE) | `codigo_lote` (String, Indexed) | `codigo` (String, Unique Constraint) | Es la clave visible para el usuario (ej. `EXP-2026-CH-04`). Inmutable en las 3 bases. |
| **Puntaje de Calidad SCA** | `score_calidad_sca` (Numeric) | `score_total` (Double, Source of Truth) | No se almacena | Se evalúa y calcula en MongoDB. El backend extrae el número y actualiza el campo de lectura rápida en PostgreSQL. |
| **Estado Operativo del Lote** | `estado` (VARCHAR, Source of Truth) | No se replica | No se replica | Si PostgreSQL cambia el estado a `EN_CUARENTENA`, cualquier intento de asociar el lote a un contrato en el backend se rechaza. |
| **Proporción de Mezcla** | No se almacena | No se almacena | `rel.proporcion_pct` (Float, Source of Truth) | La fórmula física de mezcla pertenece exclusivamente a la topología del grafo. |

### Reglas de Negocio del Dominio:
1. **Regla de Especialidad (SCA >= 80 pts):** Solo los lotes cuyo `score_total` en MongoDB sea igual o superior a 80.00 puntos pueden cambiar a tipo `EXPORTACION` en PostgreSQL.
2. **Regla de Conservación de Masa:** En toda mezcla (`:MEZCLADO_EN`), la suma de `kg_aportados` por los lotes de pergamino debe ser igual al `peso_neto_kg` del lote de exportación resultante en PostgreSQL (margen de tolerancia física: ± 1%).
3. **Regla de Propagación de Cuarentena (Flujo Crítico):** Si un análisis químico en MongoDB dictamina `NO_CONFORME`, el backend consulta a Neo4j los lotes conectados y ejecuta en PostgreSQL el bloqueo transaccional inmediato de todos los lotes involucrados.
