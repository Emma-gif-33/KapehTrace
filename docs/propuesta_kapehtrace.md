# KapehTrace: Sistema Integrado de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad

**Universidad Politécnica de Chiapas**  
**Asignatura:** Proyecto Integrador de Bases de Datos  
**Enfoque:** Arquitectura Políglota (Relacional + Documental + Grafos)  
**Alcance del Equipo:** Arquitectura de Persistencia, Modelado, Backend, API REST y Contratos de Integración  

---

## 1. Ficha de Propuesta de Aplicación (Entregable 1)

### 1.1. Nombre de la Aplicación
**KapehTrace** (*del tseltal "Kapeh" - Café, y "Trace" - Trazabilidad*).

### 1.2. Situación y Problema Concreto a Resolver
En el estado de Chiapas, principal productor de café de México, la comercialización de café de especialidad y con certificaciones (orgánico, Fair Trade, RainForest Alliance) enfrenta tres problemáticas operativas críticas:

1. **Ruptura de Trazabilidad por Mezclas en Cascada:** El grano se cosecha en micro-parcelas campesinas, se procesa en húmedo/seco en beneficios comunitarios y se consolida en mezclas sucesivas para conformar lotes homogéneos y contenedores de exportación (sacos de 69 kg). Cuando un cliente extranjero detecta un defecto o un lote contaminado en puerto de destino, rastrear hacia atrás qué parcelas originaron el problema y qué otros lotes se mezclaron con ese mismo grano resulta inmanejable mediante bases de datos relacionales tradicionales.
2. **Heterogeneidad Estructural en Pruebas de Calidad:** Cada cliente, certificadora o protocolo (SCA Specialty Coffee Association, Catación Q-Grader, Perfiles Físico-Químicos, Análisis de Pesticidas y Metadatos de Sensores de Humedad) evalúa atributos distintos. Intentar forzar esta diversidad en esquemas tabulares rígidos produce tablas llenas de valores nulos o diseños EAV (Entity-Attribute-Value) ineficientes.
3. **Control Comercial y Garantía Transaccional:** La compraventa internacional requiere contratos formales, control riguroso de inventarios en bodega para evitar sobreventas, y estados de pago auditables que exigen cumplimiento estricto de propiedades ACID.

### 1.3. Usuarios y Necesidades Principales

* **Jefe de Logística y Trazabilidad:** Necesita registrar las entregas de cereza de los productores, registrar las operaciones de mezcla y consultar el árbol genealógico completo de cualquier lote o contenedor.
* **Catador Certificado / Inspector Q-Grader:** Requiere capturar fichas de evaluación organoléptica según el protocolo SCA (fragancia, acidez, cuerpo, balance, notas descriptivas) y adjuntar análisis de laboratorio sin verse limitado por un esquema fijo.
* **Administrador Comercial / Finanzas:** Necesita emitir contratos de venta, dar seguimiento a órdenes de exportación, controlar el stock físico de sacos disponibles y asegurar que lotes con anomalías no sean facturados ni despachados.
* **Desarrolladora Frontend (Compañera de Equipo):** Requiere contratos de API predecibles, documentación Swagger/OpenAPI interactiva, objetos de transferencia de datos (DTOs) estandarizados y mensajes de error unificados para desacoplar el desarrollo de la interfaz gráfica.

### 1.4. Objetivo General
Diseñar, implementar e integrar una solución backend robusta que coordine de forma no redundante tres paradigmas de bases de datos (Relacional, Documental y Grafo), garantizando la integridad transaccional del inventario, la flexibilidad en el registro de calidad y el análisis profundo del linaje de custodia para café de especialidad.

### 1.5. Alcance y Exclusiones Explícitas

**Funcionalidades dentro del alcance (Sí se desarrollarán):**
* Registro transaccional de órdenes de compra, contratos de venta e inventario físico de sacos en bodega (SQL).
* Almacenamiento y consulta de expedientes de calidad polimórficos: fichas SCA de 10 atributos, análisis de laboratorio y auditorías de certificación (Documental).
* Modelado y consulta de la red de custodia: Parcela -> LoteCereza -> ProcesoBeneficio -> LoteMezcla -> Contenedor (Grafo).
* Algoritmo de "Análisis de Impacto Inverso": rastreo de parcelas de origen ante lote contaminado y cuarentena automática de lotes relacionados en las 3 bases.
* API REST documentada en OpenAPI / Swagger con controladores, servicios y repositorios independientes.
* Scripts reproducibles de inicialización (schema, seed data y tests de humo) ejecutables vía Docker Compose.

**Exclusiones explícitas:**
* Pasarela de cobro bancario real en línea (se modela el cambio de estado de pago en el backend).
* Timbrado fiscal digital (CFDI/SAT).
* Interfaz de usuario final (responsabilidad asignada al frontend; el backend provee contratos y mocks).

---

## 2. Justificación y Prueba de Suficiencia de los Tres Modelos

Siguiendo la regla de oro de la UPChiapas: *¿Qué capacidad esencial se pierde si se elimina una de las tres bases?*

| Paradigma | Motor Propuesto | Responsabilidad del Dominio | ¿Qué capacidad se pierde si se elimina? |
| :--- | :--- | :--- | :--- |
| **Relacional** | PostgreSQL 16 | Inventario transaccional de sacos en bodega, contratos de venta, clientes, pagos y estados legales. | **Se pierde la integridad transaccional:** Riesgo de doble venta del mismo café, inconsistencia en saldos de inventario y pérdida de restricciones de integridad referencial ACID. |
| **Documental** | MongoDB 7 | Fichas de catación SCA, perfiles sensoriales, resultados microbiológicos y certificados de origen con atributos anidados y variables. | **Se pierde la flexibilidad:** Cada método de proceso (lavado, honey, natural) y cada laboratorio tiene esquemas radicalmente distintos. En SQL causaría tablas gigantescas vacías o modelos EAV ineficientes. |
| **Grafo** | Neo4j 5 (Cypher) | Topología de mezclas de lotes, procedencia de parcelas y cadenas de custodia de extremo a extremo. | **Se pierde el análisis de linaje e impacto:** Encontrar todas las fincas que componen un contenedor tras 4 etapas de mezclas requeriría consultas SQL recursivas lentas e impredecibles. En Neo4j es un recorrido nativo instantáneo. |

---

## 3. Matriz de Responsabilidades y Fuente de Verdad

Para evitar duplicidad sin propósito e inconsistencias entre motores:

| Entidad / Atributo | Fuente de Verdad Oficial | ¿Se replica en otro motor? | Justificación y Regla de Consistencia |
| :--- | :--- | :--- | :--- |
| **Lote (ID, Código, Peso, Estado)** | **PostgreSQL** | Sí (solo `lote_id` y `codigo_lote` en Mongo y Neo4j) | Clave primaria maestra para indexación. Las otras bases usan el ID solo como referencia foránea lógica. |
| **Contrato y Facturación** | **PostgreSQL** | No | Estrictamente financiero y contable. |
| **Ficha Técnica y Catación SCA** | **MongoDB** | Sí (solo `score_total` en PostgreSQL) | Mongo almacena el JSON completo de notas sensoriales; Postgres solo guarda el puntaje final (ej. 87.5) para filtros rápidos en catálogo. |
| **Relaciones de Mezcla y Custodia** | **Neo4j** | No | Solo el grafo mantiene la estructura de dependencias y recorridos `[:MEZCLADO_CON]`, `[:PROVIENE_DE]`. |

### Política ante Fallos en Escrituras Distribuidas
Cuando una operación requiere impactar más de una base (ej. registrar una mezcla de lotes):
1. **Paso 1:** Se ejecuta y confirma la transacción en la fuente de verdad (PostgreSQL).
2. **Paso 2:** Se actualiza el grafo de relaciones en Neo4j.
3. **Paso 3:** Se inserta el documento de auditoría en MongoDB.
4. **Manejo de Fallas:** Si el paso 2 o 3 falla, el servicio del backend captura la excepción, aplica un mecanismo de compensación (revierte el estado en PostgreSQL a `ERROR_SINCRONIZACION`) y retorna código HTTP 500 con detalle del fallo, evitando inconsistencias silenciosas.

---

## 4. Arquitectura del Backend y Flujo Integrado

### 4.1. Arquitectura de Tres Capas
* **Capa de Controladores / Rutas:** Exposición de endpoints REST, validación de esquemas de entrada (Pydantic / DTOs), autenticación y serialización de respuestas JSON.
* **Capa de Servicios de Aplicación:** Orquestación de reglas de negocio, coordinación secuencial entre las tres bases y manejo de compensaciones.
* **Capa de Repositorios Especializados:**
  * `RelationalRepository`: Consultas SQL parametrizadas / ORM tipado.
  * `DocumentRepository`: Operaciones CRUD sobre colecciones BSON de MongoDB.
  * `GraphRepository`: Consultas Cypher optimizadas con drivers oficiales de Neo4j.

### 4.2. Flujo Integrado Principal: Trazabilidad y Cuarentena Preventiva
1. **Petición Frontend:** `POST /api/calidad/inspeccion/alerta` enviando código de lote y reporte de residuo contaminante.
2. **MongoDB:** Almacena el expediente con el dictamen del laboratorio y análisis químico.
3. **Neo4j:** Ejecuta una consulta Cypher de recorrido bidireccional:
   * *Hacia atrás:* Identifica la micro-parcela y productor de origen.
   * *Hacia adelante:* Localiza todos los lotes de exportación y contenedores que recibieron granos derivados de esa misma cosecha.
4. **PostgreSQL:** Con la lista de IDs de lotes afectados provista por Neo4j, ejecuta un `UPDATE lotes SET estado = 'EN_CUARENTENA' WHERE id IN (...)`, bloqueando automáticamente su venta.
5. **Respuesta Unificada:** La API retorna un objeto consolidado con el reporte técnico, el árbol de lotes congelados y el impacto en contratos comerciales.

---

## 5. Plan de Trabajo en 3 Días (Roadmap de Ejecución)

Dado el plazo de 2 a 3 días y el enfoque estricto en backend y bases de datos:

| Día | Entregable Docente | Tareas Técnicas del Backend | Entregable para Compañera (Frontend) |
| :--- | :--- | :--- | :--- |
| **Día 1** | Entregables 1, 2, 3 y 4 (Propuesta, Modelos y DDLs) | - Definición de esquemas físicos (DDL PostgreSQL, Validators Mongo, Constraints Neo4j).<br>- Levantamiento del entorno con Docker Compose.<br>- Creación de seeders con datos verosímiles de Chiapas. | - Diccionario de Datos.<br>- Especificación inicial de endpoints esperados. |
| **Día 2** | Entregables 5, 6 y 7 (Catálogo de consultas, API y Servicios) | - Implementación de repositorios y drivers oficiales.<br>- Desarrollo de lógica de negocio y servicios orquestadores.<br>- Implementación de endpoints REST y manejo de errores. | - Swagger UI funcional (`/docs`).<br>- Mocks JSON y guía de consumo de endpoints. |
| **Día 3** | Entregables 8 y 9 (Pruebas de Integración y Despliegue) | - Pruebas automatizadas de integración de extremo a extremo.<br>- Verificación de escenarios de falla y consistencia.<br>- Grabación de evidencias y README de despliegue. | - Backend 100% operativo en localhost / docker para conexión con su interfaz. |

---

## 6. Documentos de Apoyo y Contratos para la Desarrolladora Frontend

Para que el trabajo con la compañera encargada del frontend sea fluido y sin bloqueos:

### 6.1. Contrato de la API y Herramientas
1. **Documentación Swagger / OpenAPI 3.0:** La API expondrá la documentación interactiva viva en `/docs`, donde ella podrá probar cada endpoint directamente desde el navegador, conocer los payloads requeridos y ver las respuestas de ejemplo.
2. **Estructura Estándar de Respuesta:**
   ```json
   {
     "success": true,
     "data": { ... },
     "message": "Operación ejecutada correctamente",
     "timestamp": "2026-11-19T16:00:00Z"
   }
   ```
3. **Manejo Estandarizado de Errores:**
   ```json
   {
     "success": false,
     "error": {
       "code": "LOTE_EN_CUARENTENA",
       "message": "El lote solicitado se encuentra bloqueado por alerta de calidad",
       "details": [ ... ]
     }
   }
   ```

### 6.2. Catálogo Preliminar de Endpoints Prioritarios

* `GET /api/lotes` — Listado general de lotes de café con filtros por estado comercial, variedad y puntaje SCA.
* `GET /api/lotes/{id}/pasaporte` — Consulta integrada del pasaporte digital: datos comerciales (SQL), ficha sensorial (Mongo) y árbol de linaje (Neo4j).
* `POST /api/lotes/mezcla` — Registro de mezcla de dos o más lotes para conformar un lote de exportación.
* `POST /api/calidad/inspeccion` — Registro de evaluación sensorial SCA o análisis de laboratorio.
* `GET /api/trazabilidad/grafo/{codigo_lote}` — Formato de nodos y aristas (compatible con visores tipo Vis.js o Cytoscape) para renderizar el árbol genealógico en pantalla.
* `POST /api/calidad/alerta-cuarentena` — Ejecución de la prueba de integración obligatoria: aislamiento preventivo de lotes en cascada.
