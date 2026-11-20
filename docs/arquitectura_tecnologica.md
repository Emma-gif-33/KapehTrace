# Entregable 3: Arquitectura del Sistema y Selección Tecnológica

**Proyecto:** KapehTrace – Sistema Integrado de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad  
**Institución:** Universidad Politécnica de Chiapas  
**Autores:** Equipo de Arquitectura de Persistencia y Backend  

---

## 1. Visión General de la Arquitectura

Para cumplir con el requerimiento de entregar **una solución integrada y no tres ejercicios desconectados**, KapehTrace implementa una **Arquitectura en Capas con Backend Orquestador Políglota**. 

La premisa central es el **desacoplamiento total**:
* La interfaz gráfica (Frontend) no conoce las cadenas de conexión, credenciales ni la sintaxis nativa (SQL, BSON o Cypher) de ninguno de los tres motores.
* Toda interacción fluye a través de una API REST fuertemente tipada que expone contratos estandarizados en formato JSON.
* El backend actúa como un **coordinador transaccional y de consultas**, invocando repositorios especializados que encapsulan los drivers oficiales de cada base de datos.

```
       [ INTERFAZ DE USUARIO (FRONTEND) ]
        (SPA React / Vite - Desarrollado por compañera)
                       │
                       │ Peticiones HTTP / JSON
                       ▼
       [ API REST & CONTRATO SWAGGER OPENAPI 3.0 ]
                       │
                       ▼
         [ SERVICIOS DE APLICACIÓN ]
        (Reglas de negocio, consistencia y orquestación)
         ┌─────────────┼─────────────┐
         ▼             ▼             ▼
   [ REPOSITORIO  [ REPOSITORIO  [ REPOSITORIO
     RELACIONAL]   DOCUMENTAL]     DE GRAFO]
         │             │             │
   SQL / TCP 5432 BSON / TCP 27017 Bolt / TCP 7687
         ▼             ▼             ▼
   [( PostgreSQL )] [( MongoDB )]  [(  Neo4j  )]
```

---

## 2. Responsabilidades por Capa de Componentes

### 2.1. Capa de Presentación (Frontend)
* **Responsable:** Desarrolladora frontend del equipo.
* **Responsabilidad:** Renderizado de vistas de usuario (Panel de Lotes, Captura de Ficha SCA, Mapa de Trazabilidad y Gestión de Contratos).
* **Restricción de Seguridad:** Consume exclusivamente los endpoints de la API REST. No ejecuta lógica de persistencia ni cálculos de linaje.

### 2.2. Capa de Controladores y Rutas (API Gateway Interno)
* **Tecnología:** FastAPI (Python 3.11+).
* **Responsabilidad:**
  * Enrutamiento de peticiones HTTP (`GET`, `POST`, `PUT`, `DELETE`).
  * Validación sintáctica y semántica de entradas mediante modelos **Pydantic v2**.
  * Generación y publicación automática del contrato interactivo **Swagger UI (`/docs`)**.
  * Serialización de respuestas en formato DTO (*Data Transfer Object*) unificado.
  * Manejo global de excepciones y códigos de estado HTTP (400, 404, 409, 500).

### 2.3. Capa de Servicios de Aplicación (Orquestador Políglota)
* **Responsabilidad:**
  * Coordinar operaciones que involucran dos o más bases de datos.
  * Implementar la máquina de estados de los lotes (`DISPONIBLE` -> `EN_PROCESO` -> `EN_CUARENTENA` -> `EMBARCADO`).
  * Aplicar el patrón de compensación (Saga orquestada) cuando una operación distribuida falla a mitad del proceso.
  * Consolidar respuestas compuestas (ej. Pasaporte del Lote = SQL + Mongo + Neo4j) antes de retornarlas al frontend.

### 2.4. Capa de Repositorios Especializados
* **`RelationalRepository`:**
  * Implementado con **SQLAlchemy 2.0 / asyncpg**.
  * Encapsula consultas transaccionales parametrizadas (evitando inyecciones SQL).
  * Controla los bloques transaccionales atómicos (`BEGIN`, `COMMIT`, `ROLLBACK`) en PostgreSQL.
* **`DocumentRepository`:**
  * Implementado con el driver asíncrono **Motor / PyMongo**.
  * Gestiona las colecciones `fichas_calidad_sca` y `expedientes_certificacion`.
  * Valida la estructura de documentos BSON y consultas por rangos de atributos sensoriales.
* **`GraphRepository`:**
  * Implementado con el **Neo4j Official Python Driver (Protocolo Bolt)**.
  * Ejecuta consultas Cypher parametrizadas para creación de nodos, relaciones ponderadas y algoritmos de recorrido de caminos (*Pathfinding* e impacto en cascada).

---

## 3. Matriz de Decisión y Justificación del Stack Tecnológico

Siguiendo el requerimiento de la Sección 7.3 del documento de la UPChiapas, se evaluaron distintas alternativas antes de fijar la decisión técnica:

| Componente | Opción Elegida | Alternativas Evaluadas | Criterio de Selección y Justificación |
| :--- | :--- | :--- | :--- |
| **Lenguaje y Framework Backend** | **Python 3.11 + FastAPI** | Node.js (Express), Java (Spring Boot) | **1. Drivers oficiales maduros:** Python posee soporte de primer nivel para PostgreSQL (asyncpg/SQLAlchemy), MongoDB (Motor) y Neo4j (Driver oficial Bolt).<br>**2. Documentación viva Swagger:** FastAPI genera OpenAPI 3.0 automáticamente a partir del código tipado, entregando a la compañera del frontend una interfaz interactiva sin trabajo extra.<br>**3. Velocidad y asincronía:** Excelente rendimiento con `async/await` nativo para consultar los tres motores en paralelo. |
| **Motor Relacional** | **PostgreSQL 16** | MySQL 8, MariaDB | PostgreSQL ofrece un estándar SQL estricto, excelente soporte de tipos numéricos exactos (`NUMERIC` para finanzas e inventario de café), restricciones de integridad avanzadas y transacciones ACID nativas. |
| **Motor Documental** | **MongoDB 7** | CouchDB, RavenDB | MongoDB es el estándar de facto para documentos BSON, permite esquemas dinámicos para evaluaciones de calidad heterogéneas, soporta validación nativa `$jsonSchema` y consultas rápidas por subdocumentos anidados. |
| **Motor de Grafos** | **Neo4j 5 Community** | ArangoDB, Memgraph | Neo4j utiliza el lenguaje Cypher, el estándar más expresivo y legible para recorridos de caminos y linaje de transformación. Cuenta con visualizador web nativo integrado (Neo4j Browser en el puerto 7474) para demostración en clase. |
| **Orquestación de Infraestructura** | **Docker Compose v2** | Instalación local (bare-metal), Kubernetes | Permite reproducir exactamente el mismo entorno en cualquier máquina con un solo comando (`docker-compose up -d`), aislando volúmenes de datos y puertos sin requerir instalaciones complejas de servicios en el sistema operativo del evaluador. |

---

## 4. Definición de la Fuente de Verdad y Estrategia de Sincronización

Uno de los errores más severos señalados en la guía de la UPChiapas (Sección 12) es: *«Guardar los mismos datos en las tres bases sin definir fuente de verdad ni sincronización»*.

KapehTrace resuelve este desafío mediante una política explícita de **Propiedad Unidireccional de Datos**:

### 4.1. Matriz de Propiedad de Datos
* **Datos Maestros Comerciales e Inventario:** La **Base Relacional (PostgreSQL)** es la única fuente de verdad autorizada para:
  * El código único del lote (`codigo_lote`).
  * El peso neto oficial en kilogramos (`peso_neto_kg`).
  * El conteo oficial de sacos en bodega (`sacos_69kg`).
  * El estado operativo oficial (`estado`: `DISPONIBLE`, `EN_PROCESO`, `EN_CUARENTENA`, `EMBARCADO`).
* **Datos Técnicos y Sensoriales:** La **Base Documental (MongoDB)** es la única fuente de verdad autorizada para:
  * Los 10 puntajes del protocolo SCA.
  * Descriptores de notas de sabor y aromas.
  * Resultados analíticos cuantitativos de laboratorio químico (residuos de pesticidas en ppm).
* **Datos de Custodia y Linaje:** La **Base de Grafos (Neo4j)** es la única fuente de verdad autorizada para:
  * El historial de procedencia: qué parcelas aportaron grano a qué lote.
  * Las proporciones de mezcla (`proporcion_pct`, `kg_aportados`) de lotes pergamino consolidados en un lote de exportación.
  * La asignación de lotes a contenedores de transporte marítimo.

### 4.2. Estrategia de Replicación Controlada
Para maximizar el rendimiento sin introducir inconsistencias, únicamente se replica un dato entre motores:
* **`score_calidad_sca`:** Calculado como la suma de atributos en MongoDB (fuente de verdad). Al registrarse la ficha, el backend copia este valor numérico simple (ej. `88.50`) en la columna `lotes.score_calidad_sca` de PostgreSQL. 
  * *Justificación:* Permite al frontend filtrar el catálogo comercial ("Mostrar solo lotes con calidad >= 85 pts") en una sola consulta SQL rápida sin tener que cruzar bases de datos en consultas simples de listado.

### 4.3. Estrategia de Consistencia y Compensación (Saga Orquestada)
Dado el alcance académico delimitado del proyecto, no se requiere un coordinador de transacciones distribuidas pesado (tipo XA o dos fases 2PC). En su lugar, el **Servicio de Aplicación en el Backend** implementa un patrón de **Compensación por Excepción**:

```
[Inicio de Operación Compuesta]
       │
       ▼
1. Escribir en Fuente de Verdad (PostgreSQL) ──► ¿Fallo? ──► [Rollback SQL y retornar Error 400]
       │ (Éxito)
       ▼
2. Actualizar Relaciones en Grafo (Neo4j) ──────► ¿Fallo? ──► [Compensación: Revertir SQL y Error 500]
       │ (Éxito)
       ▼
3. Persistir Documento en MongoDB ─────────────► ¿Fallo? ──► [Compensación: Borrar en Neo4j, revertir SQL]
       │ (Éxito)
       ▼
[Operación Completada Exitosamente (HTTP 201)]
```

Si en cualquier punto un motor secundario no responde o rechaza la escritura, el servicio captura la excepción, ejecuta las acciones de reversión necesarias para no dejar datos huérfanos y devuelve una respuesta de error transparente al cliente.

---

## 5. Diseño Físico de Infraestructura con Docker Compose

La arquitectura se despliega de forma totalmente reproducible mediante un archivo `docker-compose.yml` que orquesta los tres motores sobre una red virtual aislada (`kapeh-network`) con volúmenes persistentes:

| Servicio | Imagen Docker Oficial | Puerto Externo (Host) | Puerto Interno | Propósito |
| :--- | :--- | :--- | :--- | :--- |
| **postgres_db** | `postgres:16-alpine` | `5432` | `5432` | Persistencia Relacional |
| **mongo_db** | `mongo:7.0` | `27017` | `27017` | Persistencia Documental |
| **neo4j_db** | `neo4j:5.15-community` | `7474` (HTTP Web Browser)<br>`7687` (Bolt Driver) | `7474`<br>`7687` | Persistencia de Grafos |

Todos los contenedores cuentan con políticas de reinicio automático (`restart: unless-stopped`) y comprobaciones de salud (*healthchecks*) para garantizar que el backend solo intente conectarse cuando los motores hayan completado su arranque.
