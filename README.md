# KapehTrace
### Sistema Integrado de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad

**Universidad Politécnica de Chiapas**  
*Proyecto Integrador de Bases de Datos*  
*«Una aplicación, tres modelos de persistencia y una solución integrada»*  

> 📄 **Documento consolidado en PDF** con los 8 entregables (propuesta, modelado, arquitectura, implementación, catálogo de operaciones, backend/API, aplicación y pruebas/despliegue): [`docs/KapehTrace_Propuesta_y_Plan_de_Integracion_de_Bases_de_Datos.pdf`](docs/KapehTrace_Propuesta_y_Plan_de_Integracion_de_Bases_de_Datos.pdf)

---

## Descripción del Proyecto

**KapehTrace** (del tseltal *Kapeh* - café, y *Trace* - trazabilidad) es una solución de software empresarial diseñada para cooperativas y exportadoras de café de especialidad en Chiapas. Resuelve la pérdida de origen en mezclas en cascada, la heterogeneidad de evaluaciones sensoriales y la rigidez de contratos internacionales coordinando de manera justificada **tres paradigmas de bases de datos**:

1. **Base Relacional (PostgreSQL 16):** Fuente de verdad de transacciones comerciales, contratos de compraventa internacional, facturación e inventario físico de sacos de 69 kg en bodega (garantía estricta ACID).
2. **Base Documental (MongoDB 7.0):** Fuente de verdad de expedientes de evaluación sensorial bajo el estándar de 10 atributos de la Specialty Coffee Association (SCA), descriptores de notas aromáticas y análisis de laboratorio fitosanitarios (esquema flexible y anidado con `$jsonSchema`).
3. **Base de Grafos (Neo4j 5.15):** Fuente de verdad de la topología de procedencia, transformaciones en beneficios húmedos/secos, mezclas físicas muchos-a-muchos ($M:N$) y rastreo de impacto sanitario en cascada mediante consultas Cypher.

---

## Arquitectura del Sistema

El sistema implementa una arquitectura en capas desacoplada. La interfaz gráfica (Frontend) consume exclusivamente una API REST orquestadora sin conectarse directamente a ninguna base de datos:

```text
[ Frontend Web (SPA React / Vite) ]
                │
                │ HTTP / JSON
                ▼
[ Backend API REST Orquestador (Node.js + TypeScript + Express) ]
  ├── OpenAPI 3.0 / Swagger UI (/api-docs)
  ├── Validación de Esquemas en Runtime con Zod
  └── Servicios de Aplicación (Consistencia Saga y Transacciones Distribuidas)
        │                 │                 │
   (Pool SQL)        (BSON Driver)      (Protocolo Bolt)
        ▼                 ▼                 ▼
  [ PostgreSQL 16 ]  [ MongoDB 7.0 ]  [ Neo4j 5.15 Community ]
```

---

## Organización del Repositorio

El proyecto sigue con exactitud la estructura recomendada en la **Sección 10 de la guía docente de la UPChiapas**:

```text
KapehTrace/
├── docs/                                  # Documentación de los 8 Entregables Oficiales
│   ├── KapehTrace_Propuesta_y_Plan_de_Integracion_de_Bases_de_Datos.pdf  # DOCUMENTO CONSOLIDADO (PDF): los 8 entregables
│   ├── propuesta_kapehtrace.md            # Entregable 1: Propuesta y justificación
│   ├── modelado_datos.md                  # Entregable 2: Modelado conceptual, ER, Docs y Grafo
│   ├── arquitectura_tecnologica.md        # Entregable 3: Arquitectura, decisión tecnológica y Saga
│   ├── implementacion_bases_datos.md      # Entregable 4: Scripts DDL, validadores y restricciones
│   ├── catalogo_operaciones_consultas.md  # Entregable 5: Fichas técnicas de operaciones
│   ├── backend_y_api.md                   # Entregable 6: Especificación de backend y contratos
│   ├── aplicacion_e_integracion.md        # Entregable 7: Flujos funcionales e integración
│   └── pruebas_documentacion_despliegue.md# Entregable 8: Matriz de pruebas y métricas
├── database/                              # Scripts reproducibles de persistencia
│   ├── seed_all.sh / seed_all.ps1         # Re-siembra las 3 bases en un solo comando
│   ├── relational/                        # PostgreSQL (schema/, data/, queries/)
│   ├── document/                          # MongoDB (validators/, data/, queries/)
│   └── graph/                             # Neo4j (schema/, data/, queries/)
├── backend/                               # Código fuente del Backend Orquestador
│   ├── Dockerfile                         # Imagen Docker multi-stage de producción
│   ├── package.json                       # Dependencias Node.js / TypeScript
│   └── src/                               # config/, controllers/, services/, repositories/, docs/
├── frontend/                              # Espacio para interfaz de usuario web
├── tests/                                 # Batería automatizada de pruebas
│   └── integration/
│       ├── test_suite_completo.js         # Ejecutor de las 7 pruebas obligatorias
│       └── test_complementarias.js        # 21 verificaciones adicionales (errores tipados, Saga, cuarentena)
├── .env.example                           # Plantilla de configuración de variables de entorno
├── docker-compose.yml                     # Orquestación de contenedores y redes internas
└── README.md                              # Este documento
```

---

## Guía de Despliegue Rápido (3 Pasos)

### Requisitos Previos
* [Docker Desktop](https://www.docker.com/products/docker-desktop/) (con Docker Compose v2) instalado y en ejecución.
* [Node.js](https://nodejs.org/) v18+ (opcional, solo para ejecutar la suite de pruebas desde el host).

---

### Paso 1: Configurar Variables de Entorno
Clona el repositorio y crea el archivo `.env` a partir de la plantilla:
```bash
cp .env.example .env
```

---

### Paso 2: Encender los Contenedores con Docker Compose
Ejecuta el siguiente comando en la raíz del proyecto:
```bash
docker-compose up -d --build
```
*Docker descargará las imágenes oficiales de PostgreSQL 16, MongoDB 7.0, Neo4j 5.15, compilará la imagen del Backend en TypeScript y levantará los 4 servicios en la red interna `kapeh-network`.*

---

### Paso 3: Inicializar y Poblar las Bases de Datos (Seeders)
Ejecuta los scripts iniciales con datos coherentes del estado de Chiapas:

**Opción rápida:** `./database/seed_all.sh` (macOS/Linux/Git Bash) o `.\database\seed_all.ps1` (Windows) re-siembran las tres bases en un solo comando. O bien, manualmente:

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

---

## Verificación Automatizada (Las 7 Pruebas Obligatorias)

Para comprobar que los tres motores y el backend orquestador funcionan correctamente de extremo a extremo, ejecuta el runner automatizado:

```bash
node tests/integration/test_suite_completo.js http://localhost:8000
```

Pruebas complementarias (validan las correcciones de la v2: códigos 404/409, Saga con compensación, cuarentena con contratos en revisión). Modifican datos, así que re-siembra antes de repetirlas:
```bash
node tests/integration/test_complementarias.js http://localhost:8000
```

El script verificará automáticamente:
1. **Conectividad:** Respuesta positiva de salud en los 3 motores (`/health`).
2. **Funcional:** Consulta del catálogo de lotes en bodega (`/api/lotes`).
3. **Integridad:** Intercepción de datos erróneos con rechazo HTTP 400.
4. **Integración Políglota:** Consulta del Pasaporte Digital coordinando SQL + Mongo + Neo4j (`/api/lotes/4/pasaporte`).
5. **Consistencia:** Validación de balance físico en mezclas M:N ($100\%$).
6. **Manejo de Errores y Cuarentena:** Protocolo de bloqueo sanitario en cascada (`/api/calidad/alerta-cuarentena`).
7. **Rendimiento:** Medición de latencia en milisegundos ($< 300\text{ ms}$).

---

## Puntos de Acceso para Demostración y Pruebas

| Servicio | URL / Puerto | Credenciales | Propósito |
| :--- | :--- | :--- | :--- |
| **Swagger UI Interactivo** | [http://localhost:8000/api-docs](http://localhost:8000/api-docs) | Ninguna | Documentación viva de la API para probar endpoints. |
| **Healthcheck de Persistencia** | [http://localhost:8000/health](http://localhost:8000/health) | Ninguna | Diagnóstico de conexión en tiempo real de las 3 bases. |
| **Neo4j Browser (Consola Web)**| [http://localhost:7474](http://localhost:7474) | `neo4j` / `kapeh_secret_2026` | Visualización del grafo de linaje de mezclas. |
| **PostgreSQL (Puerto Host)** | `localhost:5432` | `kapeh_admin` / `kapeh_secret_2026` | Conexión directa mediante DBeaver o psql. |
| **MongoDB (Puerto Host)** | `localhost:27017` | `kapeh_admin` / `kapeh_secret_2026` | Conexión directa mediante MongoDB Compass. |

---

## Cuaderno de Trabajo en Google Docs
El proyecto cuenta con seguimiento exhaustivo en Google Docs estructurado en 8 pestañas temáticas:
**[KapehTrace - Cuaderno Integrador de Bases de Datos en Google Docs](https://docs.google.com/document/d/102YvxAon2Ffx5aSCk-MGueW64aeHCcvAwSLCxYSi_VQ/edit)**
