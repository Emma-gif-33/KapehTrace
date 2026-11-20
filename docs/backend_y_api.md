# Entregable 6: Backend y API REST

**Proyecto:** KapehTrace – Sistema Integrado de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad  
**Institución:** Universidad Politécnica de Chiapas  
**Autores:** Equipo de Arquitectura de Persistencia y Backend  

---

## 1. Resumen y Criterio de Aceptación

Para dar estricto cumplimiento al **Criterio de Aceptación del Entregable 6 (Sección 7.6 de la guía UPChiapas)**:
> *«El backend coordina las bases y aplica reglas de negocio; la interfaz no se conecta directamente a las bases de datos.»*

Se ha implementado una solución de backend modular en **Node.js (v20+ LTS) con TypeScript**, estructurada bajo el patrón de arquitectura en capas (Controladores -> Servicios -> Repositorios Especializados), garantizando consultas parametrizadas, validación de esquemas en tiempo de ejecución con **Zod** y documentación interactiva mediante **OpenAPI 3.0 / Swagger UI**.

---

## 2. Decisiones Arquitectónicas del Backend

### 2.1. Selección de API REST sobre GraphQL
* **Decisión:** API REST con especificación OpenAPI 3.0.
* **Justificación Técnica:**
  1. *Simplicidad de consumo para el Frontend:* La compañera encargada de la interfaz puede consumir los endpoints usando `fetch()` o `axios` estándar sin necesidad de librerías cliente pesadas tipo Apollo Client.
  2. *Contratos Predecibles:* Los casos de uso de KapehTrace (Pasaporte Digital, Mezcla M:N, Cuarentena Preventiva) tienen estructuras de entrada y salida perfectamente definidas que se benefician del cacheo HTTP y códigos de estado REST estándar (200, 201, 400, 404, 500).
  3. *Control Fino de Transacciones Distribuidas:* En REST, cada endpoint delimita con exactitud cuándo inicia y cuándo termina la orquestación políglota y su compensación de errores.

### 2.2. Desacoplamiento por Capas
* **Capa de Rutas y Controladores (`backend/src/controllers/`):**
  * `LotesController.ts`: Maneja peticiones HTTP para catálogo, pasaporte y mezclas.
  * `CalidadController.ts`: Maneja registro de cataciones y alertas sanitarias.
* **Capa de Servicios de Aplicación (`backend/src/services/`):**
  * `LotesService.ts`: Orquestador políglota. Es el único componente con permisos para coordinar las tres bases, ejecutar compensaciones de Saga y aplicar reglas del dominio.
* **Capa de Repositorios Especializados (`backend/src/repositories/`):**
  * `relational/LotesRelationalRepository.ts`: Encapsula el driver oficial `pg`.
  * `document/CalidadDocumentRepository.ts`: Encapsula el driver oficial `mongodb`.
  * `graph/LinajeGraphRepository.ts`: Encapsula el driver oficial `neo4j-driver`.

---

## 3. Conexión mediante Drivers Oficiales y Seguridad

Ninguna consulta se concatena mediante strings directos, eliminando por completo riesgos de inyección SQL, inyección NoSQL o Cypher Injection.

### 3.1. Base Relacional (PostgreSQL): Driver `pg` (node-postgres)
* **Archivo de Configuración:** `backend/src/config/database.ts`
* **Manejo de Conexiones:** Se implementa un pool de conexiones optimizado (`new Pool({ max: 15, idleTimeoutMillis: 30000 })`).
* **Consultas Parametrizadas:**
  ```typescript
  const query = `
    INSERT INTO lotes (codigo_lote, tipo_lote, estado, peso_neto_kg, sacos_69kg, bodega_ubicacion, variedad, precio_base_kg_usd)
    VALUES ($1, $2, 'DISPONIBLE', $3, $4, $5, $6, $7)
    RETURNING *;
  `;
  const result = await pgPool.query(query, [codigo, tipo, peso, sacos, bodega, variedad, precio]);
  ```

### 3.2. Base Documental (MongoDB): Driver Oficial `mongodb`
* **Manejo de Conexiones:** Cliente nativo `MongoClient` con reconexión automática y autenticación sobre la base `kapeh_trace_docs`.
* **Seguridad y Tipado:** Operaciones sobre colecciones fuertemente tipadas mediante TypeScript DTOs.
  ```typescript
  const collection = getMongoDb().collection<FichaCalidadDocument>('fichas_calidad_sca');
  await collection.insertOne(ficha);
  ```

### 3.3. Base de Grafos (Neo4j): Driver Oficial `neo4j-driver` (Protocolo Bolt)
* **Manejo de Conexiones:** Conexión mediante protocolo binario optimizado `bolt://localhost:7687` con autenticación básica.
* **Sesiones y Parámetros Cypher:**
  ```typescript
  const session = neo4jDriver.session();
  try {
    const cypher = `
      MATCH (le:LoteExportacion {codigo: $codigo})<-[m:MEZCLADO_EN]-(lp:LotePergamino)
      RETURN lp.codigo AS lote_pergamino, m.proporcion_pct AS proporcion;
    `;
    const res = await session.run(cypher, { codigo: codigoExportacion });
  } finally {
    await session.close();
  }
  ```

---

## 4. Validación de Entradas y Manejo Centralizado de Errores

### 4.1. Validación Estricta con Zod (`backend/src/middleware/validate.ts`)
Cada petición con cuerpo JSON es interceptada y validada contra esquemas estrictos de Zod antes de alcanzar los controladores. Si un campo no cumple con el tipo o restricción, se rechaza inmediatamente con HTTP 400 y el desglose de campos inválidos:
```json
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Los datos enviados en el cuerpo de la petición no cumplen con el esquema requerido.",
    "details": [
      {
        "field": "peso_neto_kg",
        "message": "El peso neto debe ser mayor a 0"
      }
    ]
  }
}
```

### 4.2. Middleware Global de Errores (`backend/src/middleware/errorHandler.ts`)
Captura cualquier excepción no controlada en el pipeline y garantiza que la interfaz siempre reciba una respuesta JSON estructurada con código HTTP semántico (400, 404, 409, 500), evitando que el servidor se caiga o exponga trazas internas de la base de datos al usuario.

---

## 5. Documentación Interactiva de Contratos con Swagger UI

Para que la compañera encargada del frontend cuente con una referencia viva y autónoma, el backend expone la especificación OpenAPI 3.0 en la ruta:
👉 **`http://localhost:8000/api-docs`**

### Catálogo de Rutas Expuestas:

| Método | Endpoint | Base(s) Coordinada(s) | Descripción |
| :--- | :--- | :--- | :--- |
| `GET` | `/health` | PostgreSQL + MongoDB + Neo4j | Comprueba el estado de salud y conectividad con las 3 bases de datos. |
| `GET` | `/api/lotes` | PostgreSQL | Listado general de lotes con filtros por estado, variedad y puntaje SCA. |
| `POST` | `/api/lotes` | PostgreSQL | Alta física de un nuevo lote en bodega con cálculo de sacos de 69 kg. |
| `GET` | `/api/lotes/:id/pasaporte` | **SQL + Mongo + Neo4j** | **Flujo Integrado:** Consulta del Pasaporte Digital del Lote de Exportación. |
| `POST` | `/api/lotes/mezcla` | **SQL + Neo4j** | **Flujo Integrado:** Registro de mezcla física M:N con consistencia Saga. |
| `GET` | `/api/lotes/:codigo/grafo` | Neo4j | Retorna nodos y aristas en formato JSON listo para visores (Vis.js / Cytoscape). |
| `POST` | `/api/calidad/inspeccion` | **Mongo + SQL** | Registro de evaluación sensorial SCA y replicación de score en PostgreSQL. |
| `POST` | `/api/calidad/alerta-cuarentena`| **Mongo + Neo4j + SQL** | **Flujo Integrado:** Protocolo de alerta sanitaria y cuarentena en cascada. |

---

## 6. Guía de Consumo para la Desarrolladora Frontend

Para integrar la interfaz gráfica sin complicaciones:

1. **Configuración de CORS:**
   El backend tiene habilitado `cors()`, lo que permite que el frontend (corriendo habitualmente en Vite en `http://localhost:5173` o similar) realice peticiones `fetch()` directas sin bloqueos del navegador.
2. **Formato Estándar de Respuesta:**
   Todas las respuestas exitosas devuelven un objeto con la llave `success: true`:
   ```typescript
   interface ApiResponse<T> {
     success: boolean;
     data: T;
     message?: string;
   }
   ```
3. **Página de Pruebas Viva:**
   Solo debe ingresar a `http://localhost:8000/api-docs` para probar los payloads de ejemplo, dar clic en "Try it out" y copiar las respuestas reales generadas por el backend.
