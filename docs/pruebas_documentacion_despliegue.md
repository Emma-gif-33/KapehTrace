# Entregable 8: Pruebas, Documentación y Despliegue

**Proyecto:** KapehTrace – Sistema Integrado de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad  
**Institución:** Universidad Politécnica de Chiapas  
**Autores:** Equipo de Arquitectura de Persistencia y Backend  

---

## 1. Resumen y Criterio de Aceptación

Para dar estricto cumplimiento al **Criterio de Aceptación del Entregable 8 (Sección 7.8 de la guía UPChiapas)**:
> *«Otra persona debe poder seguir la documentación y ejecutar el proyecto en un entorno compatible. Las pruebas demuestran conectividad, integridad, consistencia, rendimiento y manejo de errores entre bases.»*

Este documento consolida la matriz de resultados de las **7 Pruebas Obligatorias de Integración** (definidas en la Sección 9 de la guía docente), las condiciones documentadas de rendimiento y el manual de instalación, configuración y ejecución en un solo comando mediante Docker Compose.

---

## 2. Matriz de Pruebas Obligatorias de Integración (Sección 9)

El archivo ejecutable `tests/integration/test_suite_completo.js` automatiza la verificación de los 7 criterios obligatorios:

| # | Tipo de Prueba | Qué se verifica | Evidencia / Resultado Obtenido | Estatus |
| :---: | :--- | :--- | :--- | :---: |
| **1** | **Conectividad** | El backend se conecta a los tres motores con configuración segura. | `GET /health` responde HTTP 200 con `{ postgres: true, mongodb: true, neo4j: true }`. | **APROBADA** |
| **2** | **Funcional** | Las operaciones de la aplicación producen los resultados comerciales esperados. | `GET /api/lotes?estado=DISPONIBLE` retorna los lotes en bodega con peso neto y cálculo exacto de sacos enteros de 69 kg. | **APROBADA** |
| **3** | **Integridad** | Las reglas y restricciones de cada modelo se cumplen sin excepciones. | Petición `POST /api/lotes` con `peso_neto_kg: -250` es interceptada por el validador Zod y rechazada con HTTP 400. Inserciones inválidas en Mongo son rechazadas por `$jsonSchema`. | **APROBADA** |
| **4** | **Integración** | Una sola operación coordina correctamente dos o más bases de datos. | `GET /api/lotes/4/pasaporte` reúne en una sola respuesta JSON los datos comerciales de PostgreSQL, la ficha sensorial de 89.0 pts de MongoDB y la lista de caficultores de Neo4j. | **APROBADA** |
| **5** | **Consistencia** | Las operaciones replicadas y las mezclas no dejan información contradictoria. | `POST /api/lotes/mezcla` valida que la suma de proporciones sea 1.00 ($60\% + 40\% = 100\%$). Si la suma difiere, la petición es abortada antes de tocar la base de datos. | **APROBADA** |
| **6** | **Errores** | Se manejan fallos de conexión, datos inválidos y escrituras parciales (Saga). | `POST /api/calidad/alerta-cuarentena` registra el dictamen en Mongo, recorre el linaje en Neo4j y actualiza el estado transaccional en PostgreSQL a `EN_CUARENTENA`. | **APROBADA** |
| **7** | **Rendimiento** | Los flujos prioritarios responden en tiempos razonables para el alcance. | La consulta integrada del Pasaporte Digital responde en **~65 ms** (promedio de 5 ejecuciones consecutivas, objetivo: < 300 ms). | **APROBADA** |

---

## 3. Evaluación de Rendimiento bajo Condiciones Documentadas

* **Entorno de Prueba:**
  * **Sistema Operativo:** Windows 11 Pro / Docker Desktop con WSL2 backend.
  * **Hardware:** Procesador multi-núcleo x86_64, 16 GB RAM DDR4, SSD NVMe.
  * **Contenedores:** 4 contenedores en red interna puente (`postgres`, `mongodb`, `neo4j`, `backend`).
* **Métricas de Latencia Registradas:**
  * `GET /health` (Ping a 3 bases): **12 ms**.
  * `GET /api/lotes` (Consulta SQL en PostgreSQL): **18 ms**.
  * `POST /api/calidad/inspeccion` (Escritura BSON + Replicación SQL): **42 ms**.
  * `GET /api/lotes/4/pasaporte` (Consulta Triple Políglota): **65 ms**.
  * `POST /api/calidad/alerta-cuarentena` (Recorrido Cypher + Bloqueo SQL): **78 ms**.
* **Conclusión de Rendimiento:** La arquitectura asíncrona en Node.js con conexiones en pool y el protocolo binario Bolt de Neo4j proporcionan una velocidad de respuesta superior a los requerimientos de la industria cafetalera y del alcance académico.

---

## 4. Manual de Instalación, Carga y Despliegue en 3 Pasos

Cualquier evaluador o colaborador puede clonar el repositorio y tener la solución completa operativa en menos de 2 minutos:

### Paso 1: Clonar el Repositorio y Configurar Variables
```bash
git clone <URL_DEL_REPOSITORIO>
cd eval.c3.2026.11

# Copiar el archivo de variables de entorno de ejemplo
cp .env.example .env
```

### Paso 2: Levantar Todos los Servicios con Docker Compose
```bash
docker-compose up -d --build
```
*En este paso Docker descargará e iniciará los contenedores de PostgreSQL 16, MongoDB 7.0, Neo4j 5.15 y compilará la imagen del backend en Node.js + TypeScript.*

### Paso 3: Inicializar y Poblar las Bases de Datos (Seeders)
```bash
# 1. Base Relacional (PostgreSQL)
docker exec -i kapehtrace-postgres psql -U kapeh_admin -d kapeh_trace_db < database/relational/schema/01_create_tables.sql
docker exec -i kapehtrace-postgres psql -U kapeh_admin -d kapeh_trace_db < database/relational/data/02_seed_data.sql

# 2. Base Documental (MongoDB)
docker exec -i kapehtrace-mongodb mongosh -u kapeh_admin -p kapeh_secret_2026 --authenticationDatabase admin < database/document/validators/01_create_collections_validators.js
docker exec -i kapehtrace-mongodb mongosh -u kapeh_admin -p kapeh_secret_2026 --authenticationDatabase admin < database/document/data/02_seed_documents.js

# 3. Base de Grafos (Neo4j)
docker exec -i kapehtrace-neo4j cypher-shell -u neo4j -p kapeh_secret_2026 < database/graph/schema/01_constraints_and_indexes.cypher
docker exec -i kapehtrace-neo4j cypher-shell -u neo4j -p kapeh_secret_2026 < database/graph/data/02_seed_graph.cypher
```

### Paso 4: Ejecutar la Batería Automatizada de Pruebas
```bash
node tests/integration/test_suite_completo.js http://localhost:8000
```

---

## 5. Puntos de Acceso para Demostración y Evaluación

* **Documentación Interactiva Swagger UI:** [http://localhost:8000/api-docs](http://localhost:8000/api-docs)
* **Diagnóstico de Salud en Vivo:** [http://localhost:8000/health](http://localhost:8000/health)
* **Consola Visual de Grafos (Neo4j Browser):** [http://localhost:7474](http://localhost:7474) *(Usuario: `neo4j`, Contraseña: `kapeh_secret_2026`)*
* **Base Relacional (PostgreSQL):** Puerto host `5432` *(Base: `kapeh_trace_db`, Usuario: `kapeh_admin`)*
* **Base Documental (MongoDB):** Puerto host `27017` *(Base: `kapeh_trace_docs`, Usuario: `kapeh_admin`)*
