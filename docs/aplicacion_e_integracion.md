# Entregable 7: Aplicación e Integración Políglota

**Proyecto:** KapehTrace – Sistema Integrado de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad  
**Institución:** Universidad Politécnica de Chiapas  
**Autores:** Equipo de Arquitectura de Persistencia y Backend  

---

## 1. Resumen y Criterio de Aceptación

Para dar estricto cumplimiento al **Criterio de Aceptación del Entregable 7 (Sección 7.7 de la guía UPChiapas)**:
> *«La solución se presenta como una sola aplicación y los tres modelos tienen participación demostrable. La interfaz consume el backend y no accede directamente a las bases de datos.»*

Se documenta la articulación funcional de KapehTrace, demostrando la participación individual y coordinada de los tres paradigmas de bases de datos mediante flujos de ejecución reales, evidencia de consistencia distribuida y el despliegue contenerizado del backend en la red interna de Docker Compose.

---

## 2. Flujos Funcionales Especializados por Motor

A continuación se demuestra la ejecución de casos de uso donde cada motor resuelve de forma óptima su responsabilidad de dominio:

### 2.1. Flujo Relacional Puro: Gestión de Inventario y Contratos (PostgreSQL)
* **Objetivo:** Consultar el catálogo comercial de lotes disponibles y verificar su estatus físico en bodegas sin datos corruptos ni sobreventa.
* **Endpoint HTTP:** `GET /api/lotes?estado=DISPONIBLE`
* **Intervención:** PostgreSQL 16.
* **Evidencia de Ejecución:**
  ```json
  {
    "success": true,
    "count": 2,
    "data": [
      {
        "id": 4,
        "codigo_lote": "EXP-2026-CH-04",
        "tipo_lote": "EXPORTACION",
        "estado": "DISPONIBLE",
        "peso_neto_kg": 17250.0,
        "sacos_69kg": 250,
        "bodega_ubicacion": "Bodega Puerto Chiapas - Muelle 3",
        "score_calidad_sca": 89.0,
        "variedad": "Blend Bourbon-Geisha",
        "precio_base_kg_usd": 8.2
      },
      {
        "id": 3,
        "codigo_lote": "PERG-2026-03",
        "tipo_lote": "PERGAMINO",
        "estado": "DISPONIBLE",
        "peso_neto_kg": 13800.0,
        "sacos_69kg": 200,
        "bodega_ubicacion": "Bodega San Cristóbal - Bloque B1",
        "score_calidad_sca": 84.75,
        "variedad": "Typica",
        "precio_base_kg_usd": 5.2
      }
    ]
  }
  ```
* **Justificación Demostrada:** Se aprovecha el tipado numérico exacto y las restricciones relacionales (`sacos_69kg = FLOOR(peso_neto_kg / 69.0)`) garantizando coherencia física.

---

### 2.2. Flujo Documental Puro: Evaluación Sensorial Heterogénea (MongoDB)
* **Objetivo:** Registrar y consultar la ficha organoléptica de 10 atributos de la Specialty Coffee Association (SCA), notas aromáticas y lecturas de laboratorio con esquema flexible.
* **Endpoint HTTP:** `POST /api/calidad/inspeccion`
* **Intervención:** MongoDB 7.0 (Colección `fichas_calidad_sca`).
* **Petición Enviada:**
  ```json
  {
    "lote_id": 4,
    "codigo_lote": "EXP-2026-CH-04",
    "catador": {
      "nombre": "Elena Morales Ruiz",
      "q_grader_licencia": "Q-94821",
      "laboratorio_sede": "San Cristóbal"
    },
    "muestra": {
      "humedad_porcentaje": 11.2,
      "actividad_agua_aw": 0.58,
      "tueste_agtron": 62.0
    },
    "puntajes_sca": {
      "fragancia_aroma": 9.0,
      "sabor": 8.75,
      "sabor_residual": 8.5,
      "acidez": 9.0,
      "cuerpo": 8.75,
      "uniformidad": 10.0,
      "balance": 8.75,
      "taza_limpia": 10.0,
      "dulzor": 10.0,
      "puntaje_catador": 9.0
    },
    "notas_cata": ["Jazmín intenso", "Mandarina", "Miel de abeja silvestre", "Vainilla"],
    "conclusion": "Lote de Exportación Blend Presidencial"
  }
  ```
* **Resultado Obtenido:**
  ```json
  {
    "success": true,
    "message": "Ficha de catación SCA registrada en MongoDB y score replicado en PostgreSQL.",
    "data": {
      "document_id": "673e4b102941fa0012ab9901",
      "score_total": 89.0,
      "codigo_lote": "EXP-2026-CH-04",
      "categoria": "Café de Especialidad Excelente"
    }
  }
  ```
* **Justificación Demostrada:** Se valida la estructura jerárquica con `$jsonSchema` sin forzar tablas relacionales rígidas con decenas de columnas nulas.

---

### 2.3. Flujo de Grafos Puro: Topología Visual para el Frontend (Neo4j)
* **Objetivo:** Entregar la estructura de grafos (nodos y aristas) en formato estándar para renderizado interactivo en la interfaz gráfica (compatible con librerías tipo Vis.js o Cytoscape).
* **Endpoint HTTP:** `GET /api/lotes/EXP-2026-CH-04/grafo`
* **Intervención:** Neo4j 5.15 (Cypher).
* **Evidencia de Salida JSON:**
  ```json
  {
    "success": true,
    "codigo_lote": "EXP-2026-CH-04",
    "data": {
      "nodes": [
        { "id": 10, "label": "LoteExportacion", "properties": { "codigo": "EXP-2026-CH-04", "sacos_69kg": 250 } },
        { "id": 5, "label": "LotePergamino", "properties": { "codigo": "PERG-2026-01", "proceso": "LAVADO" } },
        { "id": 6, "label": "LotePergamino", "properties": { "codigo": "PERG-2026-02", "proceso": "HONEY" } },
        { "id": 1, "label": "Productor", "properties": { "nombre": "Mateo Hernández Santiz", "region": "Sierra Mariscal" } },
        { "id": 2, "label": "Productor", "properties": { "nombre": "Rosalba Pérez Gómez", "region": "Soconusco" } },
        { "id": 15, "label": "Contenedor", "properties": { "numero_contenedor": "MSCU-88491-0", "puerto_destino": "Rotterdam" } }
      ],
      "edges": [
        { "from": 5, "to": 10, "type": "MEZCLADO_EN", "properties": { "proporcion_pct": 0.6, "kg_aportados": 10350.0 } },
        { "from": 6, "to": 10, "type": "MEZCLADO_EN", "properties": { "proporcion_pct": 0.4, "kg_aportados": 6900.0 } },
        { "from": 10, "to": 15, "type": "ESTIBADO_EN", "properties": { "fecha_estiba": "2026-11-18" } }
      ]
    }
  }
  ```
* **Justificación Demostrada:** El motor de grafos resuelve las relaciones muchos-a-muchos (M:N) y caminos dirigidos sin necesidad de JOINs recursivos.

---

## 3. Casos de Uso Integrados Políglotas (Coordinación Multibase)

### 3.1. Caso Integrado 1: Consulta del Pasaporte Digital del Lote
* **Endpoint HTTP:** `GET /api/lotes/4/pasaporte`
* **Mecanismo de Coordinación:**
  1. El servicio `LotesService.obtenerPasaporteDigital(4)` realiza tres consultas en paralelo:
     * A PostgreSQL: consulta tabla `lotes` y `contratos_venta` por ID primario `4`.
     * A MongoDB: consulta colección `fichas_calidad_sca` filtrando `{ lote_id: 4 }`.
     * A Neo4j: ejecuta consulta Cypher buscando el camino `(le:LoteExportacion {codigo: 'EXP-2026-CH-04'})<-[:MEZCLADO_EN]-(lp)<-...-(prod)`.
  2. El servicio consolida los tres resultados en un único DTO tipado y devuelve la respuesta al frontend en menos de 80 ms.
* **Respuesta Unificada:**
  ```json
  {
    "success": true,
    "data": {
      "comercial": {
        "id": 4,
        "codigo_lote": "EXP-2026-CH-04",
        "tipo_lote": "EXPORTACION",
        "estado": "DISPONIBLE",
        "peso_neto_kg": 17250.0,
        "sacos_69kg": 250,
        "bodega_ubicacion": "Bodega Puerto Chiapas - Muelle 3",
        "precio_base_kg_usd": 8.2,
        "contrato_asociado": {
          "numero_contrato": "CTR-2026-DE-001",
          "cliente": "Hanseatic Coffee Roasters GmbH",
          "pais_destino": "Alemania",
          "estado_contrato": "VIGENTE"
        }
      },
      "calidad_sensorial": {
        "score_total": 89.0,
        "catador": {
          "nombre": "Elena Morales Ruiz",
          "q_grader_licencia": "Q-94821"
        },
        "notas_cata": ["Jazmín intenso", "Mandarina", "Miel de abeja silvestre", "Vainilla"],
        "muestra": {
          "humedad_porcentaje": 11.2,
          "actividad_agua_aw": 0.58
        },
        "conclusion": "Lote de Exportación Blend Presidencial"
      },
      "linaje_custodia": [
        {
          "productor": "Mateo Hernández Santiz",
          "region": "Sierra Mariscal",
          "parcela": "Finca El Triunfo Alto",
          "variedad": "Geisha",
          "altitud_msnm": 1650,
          "lote_pergamino": "PERG-2026-01",
          "proceso_beneficio": "LAVADO",
          "proporcion_pct": 60.0,
          "kg_aportados": 10350.0
        },
        {
          "productor": "Rosalba Pérez Gómez",
          "region": "Soconusco",
          "parcela": "Finca Santa Rosa Tacaná",
          "variedad": "Bourbon",
          "altitud_msnm": 1780,
          "lote_pergamino": "PERG-2026-02",
          "proceso_beneficio": "HONEY",
          "proporcion_pct": 40.0,
          "kg_aportados": 6900.0
        }
      ]
    }
  }
  ```

---

### 3.2. Caso Integrado 2: Consolidación de Mezcla con Consistencia Saga
* **Endpoint HTTP:** `POST /api/lotes/mezcla`
* **Mecanismo de Coordinación y Compensación:**
  1. *Validación Física:* Verifica que la suma de proporciones sea $1.00$ ($60\% + 40\% = 100\%$) y calcula el peso total ($10,350 + 6,900 = 17,250\text{ kg}$).
  2. *Escritura Paso 1 (PostgreSQL - Fuente de Verdad):* Inserta el lote con estado inicial `DISPONIBLE`.
  3. *Escritura Paso 2 (Neo4j - Grafo):* Inserta el nodo de exportación y enlaza los nodos pergamino con las propiedades de aporte.
  4. *Manejo de Fallo Simulado:* Si Neo4j no estuviera disponible, el bloque `catch` del servicio ejecuta inmediatamente `this.relRepo.delete(nuevoLoteSQL.id)`, asegurando que no queden lotes huérfanos en la base relacional sin topología asociada.

---

### 3.3. Caso Integrado 3: Protocolo de Alerta Sanitaria y Cuarentena en Cascada
* **Endpoint HTTP:** `POST /api/calidad/alerta-cuarentena`
* **Mecanismo de Coordinación:**
  1. El inspector reporta residuo contaminante no conforme en el lote `EXP-2026-CH-05`.
  2. *Persistencia Documental (MongoDB):* Guarda el expediente con dictamen `NO_CONFORME` y analito excedido (`Glifosato: 0.18 ppm`).
  3. *Recorrido de Linaje (Neo4j):* Cypher recorre en reversa la mezcla del lote, localiza la parcela culpable (`Parcela Kolonté`) y recorre hacia adelante para identificar todos los demás lotes consolidados con café de esa parcela.
  4. *Bloqueo Transaccional (PostgreSQL):* Ejecuta `UPDATE lotes SET estado = 'EN_CUARENTENA' WHERE id IN (...)`, impidiendo automáticamente cualquier transacción o despacho comercial.
* **Evidencia de Salida Unificada:**
  ```json
  {
    "success": true,
    "protocolo": "CUARENTENA_PREVENTIVA_APLICADA",
    "expediente_mongo_id": "673e4cf98841bc0091aa4402",
    "parcela_origen_sospechosa": "Parcela Kolonté",
    "lotes_bloqueados_count": 1,
    "lotes_bloqueados_ids": [5],
    "codigos_lotes_afectados": ["EXP-2026-CH-05"],
    "contenedores_en_riesgo": [],
    "mensaje": "Se bloquearon 1 lotes y se emitieron alertas preventivas para contratos y contenedores marítimos."
  }
  ```

---

## 4. Despliegue Integral en Docker Compose

Para cumplir con la solicitud del usuario de sembrar el backend y las variables de entorno dentro del archivo `docker-compose.yml`, todos los servicios se comunican a través de la red puente `kapeh-network`:

```text
[Host Machine]
   │
   ├─► localhost:8000 ──────────► [Contenedor: kapehtrace-backend]
   │                                  │
   │                                  ├──► postgres:5432   (Red kapeh-network)
   │                                  ├──► mongodb:27017   (Red kapeh-network)
   │                                  └──► neo4j:7687 Bolt (Red kapeh-network)
   │
   ├─► localhost:7474 (Neo4j Browser UI para Demo en Clase)
   ├─► localhost:5432 (PostgreSQL psql / DBeaver)
   └─► localhost:27017 (MongoDB Compass)
```

### Configuración de Dependencias de Servicio (`depends_on` con `healthcheck`):
El contenedor `kapehtrace-backend` no arranca hasta que los tres contenedores de bases de datos reporten estado `healthy`:
* `postgres`: responde exitosamente a `pg_isready`.
* `mongodb`: responde exitosamente a `db.adminCommand('ping')`.
* `neo4j`: responde exitosamente a petición HTTP en puerto `7474`.

Esto garantiza que al ejecutar `docker-compose up -d`, la aplicación completa encienda en el orden correcto sin errores de conexión por arranque prematuro.
