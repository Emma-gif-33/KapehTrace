export const swaggerDocument = {
  openapi: '3.0.3',
  info: {
    title: 'KapehTrace API - Documentación Oficial para Frontend',
    version: '1.0.0',
    description: `
API REST del Sistema Integrado de Trazabilidad, Calidad y Cadena de Custodia para Café de Especialidad (KapehTrace).
Esta API coordina tres paradigmas de persistencia sin que el frontend necesite conectarse directamente a ninguna base de datos:
* **PostgreSQL:** Fuente de verdad para inventario de sacos, transacciones comerciales y contratos.
* **MongoDB:** Expedientes sensoriales SCA y análisis de laboratorio polimórficos.
* **Neo4j:** Topología del linaje de mezclas, procedencia de parcelas y análisis de impacto en reversa.
    `,
    contact: {
      name: 'Equipo de Arquitectura y Backend KapehTrace - UPChiapas',
    },
  },
  servers: [
    {
      url: 'http://localhost:8000',
      description: 'Servidor de Desarrollo Local',
    },
  ],
  tags: [
    { name: 'Diagnóstico', description: 'Comprobación de salud y conectividad con las 3 bases de datos' },
    { name: 'Lotes y Comercial', description: 'Gestión de inventario físico, catálogo y mezclas de exportación' },
    { name: 'Calidad SCA e Inocuidad', description: 'Evaluaciones sensoriales, laboratorios y protocolo de cuarentena' },
  ],
  paths: {
    '/health': {
      get: {
        tags: ['Diagnóstico'],
        summary: 'Comprobar estado de conectividad con los 3 motores de persistencia',
        responses: {
          '200': {
            description: 'Estado de conexión retornado con éxito',
            content: {
              'application/json': {
                example: {
                  status: 'UP',
                  timestamp: '2026-11-20T15:00:00Z',
                  databases: {
                    postgres: true,
                    mongodb: true,
                    neo4j: true,
                  },
                },
              },
            },
          },
        },
      },
    },
    '/api/lotes': {
      get: {
        tags: ['Lotes y Comercial'],
        summary: 'Listar catálogo de lotes con filtros opcionales',
        parameters: [
          { name: 'estado', in: 'query', schema: { type: 'string', enum: ['DISPONIBLE', 'EN_PROCESO', 'EN_CUARENTENA', 'EMBARCADO'] } },
          { name: 'tipo', in: 'query', schema: { type: 'string', enum: ['CEREZA', 'PERGAMINO', 'EXPORTACION'] } },
          { name: 'minScore', in: 'query', schema: { type: 'number' }, description: 'Filtrar por puntaje SCA mínimo' },
        ],
        responses: {
          '200': {
            description: 'Lista de lotes recuperada desde PostgreSQL',
            content: {
              'application/json': {
                example: {
                  success: true,
                  count: 1,
                  data: [
                    {
                      id: 4,
                      codigo_lote: 'EXP-2026-CH-04',
                      tipo_lote: 'EXPORTACION',
                      estado: 'DISPONIBLE',
                      peso_neto_kg: 17250.0,
                      sacos_69kg: 250,
                      bodega_ubicacion: 'Bodega Puerto Chiapas - Muelle 3',
                      score_calidad_sca: 89.0,
                      variedad: 'Blend Bourbon-Geisha',
                      precio_base_kg_usd: 8.2,
                    },
                  ],
                },
              },
            },
          },
        },
      },
      post: {
        tags: ['Lotes y Comercial'],
        summary: 'Registrar un nuevo lote físico en bodega (PostgreSQL)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['codigo_lote', 'tipo_lote', 'peso_neto_kg', 'bodega_ubicacion', 'variedad', 'precio_base_kg_usd'],
                properties: {
                  codigo_lote: { type: 'string', example: 'PERG-2026-05' },
                  tipo_lote: { type: 'string', enum: ['CEREZA', 'PERGAMINO', 'EXPORTACION'], example: 'PERGAMINO' },
                  peso_neto_kg: { type: 'number', example: 10350.0 },
                  bodega_ubicacion: { type: 'string', example: 'Bodega Central Tapachula' },
                  variedad: { type: 'string', example: 'Typica' },
                  precio_base_kg_usd: { type: 'number', example: 5.5 },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Lote registrado exitosamente' },
          '400': { description: 'Error de validación en parámetros' },
        },
      },
    },
    '/api/lotes/{id}/pasaporte': {
      get: {
        tags: ['Lotes y Comercial'],
        summary: 'CASO INTEGRADO: Consultar Pasaporte Digital del Lote (PostgreSQL + MongoDB + Neo4j)',
        description: 'Orquesta las tres bases de datos en un solo JSON estructurado para mostrar ficha comercial, perfil organoléptico y árbol genealógico de fincas.',
        parameters: [
          { name: 'id', in: 'path', required: true, schema: { type: 'integer' }, example: 4 },
        ],
        responses: {
          '200': {
            description: 'Pasaporte integrado devuelto con éxito',
            content: {
              'application/json': {
                example: {
                  comercial: {
                    id: 4,
                    codigo_lote: 'EXP-2026-CH-04',
                    estado: 'DISPONIBLE',
                    peso_neto_kg: 17250.0,
                    sacos_69kg: 250,
                    bodega_ubicacion: 'Bodega Puerto Chiapas - Muelle 3',
                  },
                  calidad_sensorial: {
                    score_total: 89.0,
                    notas_cata: ['Jazmín intenso', 'Mandarina', 'Miel de abeja silvestre'],
                    catador: { nombre: 'Elena Morales Ruiz', q_grader_licencia: 'Q-94821' },
                  },
                  linaje_custodia: [
                    {
                      productor: 'Mateo Hernández Santiz',
                      parcela: 'Finca El Triunfo Alto',
                      variedad: 'Geisha',
                      proporcion_pct: 60.0,
                    },
                    {
                      productor: 'Rosalba Pérez Gómez',
                      parcela: 'Finca Santa Rosa Tacaná',
                      variedad: 'Bourbon',
                      proporcion_pct: 40.0,
                    },
                  ],
                },
              },
            },
          },
          '404': { description: 'El lote solicitado no existe' },
        },
      },
    },
    '/api/lotes/mezcla': {
      post: {
        tags: ['Lotes y Comercial'],
        summary: 'CASO INTEGRADO: Consolidar Mezcla de Exportación con Consistencia Saga (PostgreSQL + Neo4j)',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['codigo_exportacion', 'variedad_blend', 'bodega_ubicacion', 'precio_base_kg_usd', 'componentes'],
                properties: {
                  codigo_exportacion: { type: 'string', example: 'EXP-2026-CH-06' },
                  variedad_blend: { type: 'string', example: 'Blend Geisha-Bourbon' },
                  bodega_ubicacion: { type: 'string', example: 'Bodega Puerto Chiapas' },
                  precio_base_kg_usd: { type: 'number', example: 9.0 },
                  componentes: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        codigo_pergamino: { type: 'string', example: 'PERG-2026-01' },
                        proporcion: { type: 'number', example: 0.6 },
                        kg_aportados: { type: 'number', example: 10350.0 },
                      },
                    },
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Mezcla registrada y linaje de grafos vinculado' },
          '400': { description: 'Error de proporciones o validación' },
          '500': { description: 'Fallo distribuido con compensación ejecutada' },
        },
      },
    },
    '/api/lotes/{codigo}/grafo': {
      get: {
        tags: ['Lotes y Comercial'],
        summary: 'Obtener topología de nodos y relaciones para visor interactivo (Vis.js / Cytoscape)',
        parameters: [
          { name: 'codigo', in: 'path', required: true, schema: { type: 'string' }, example: 'EXP-2026-CH-04' },
        ],
        responses: {
          '200': { description: 'Nodos y aristas para renderizar en Frontend' },
        },
      },
    },
    '/api/calidad/inspeccion': {
      post: {
        tags: ['Calidad SCA e Inocuidad'],
        summary: 'Registrar ficha de catación SCA (MongoDB) y replicar puntaje en PostgreSQL',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['lote_id', 'codigo_lote', 'catador', 'puntajes_sca', 'notas_cata'],
                properties: {
                  lote_id: { type: 'integer', example: 4 },
                  codigo_lote: { type: 'string', example: 'EXP-2026-CH-04' },
                  catador: {
                    type: 'object',
                    properties: {
                      nombre: { type: 'string', example: 'Elena Morales Ruiz' },
                      q_grader_licencia: { type: 'string', example: 'Q-94821' },
                    },
                  },
                  puntajes_sca: {
                    type: 'object',
                    properties: {
                      fragancia_aroma: { type: 'number', example: 9.0 },
                      sabor: { type: 'number', example: 8.75 },
                      sabor_residual: { type: 'number', example: 8.5 },
                      acidez: { type: 'number', example: 9.0 },
                      cuerpo: { type: 'number', example: 8.75 },
                      uniformidad: { type: 'number', example: 10.0 },
                      balance: { type: 'number', example: 8.75 },
                      taza_limpia: { type: 'number', example: 10.0 },
                      dulzor: { type: 'number', example: 10.0 },
                      puntaje_catador: { type: 'number', example: 9.0 },
                    },
                  },
                  notas_cata: {
                    type: 'array',
                    items: { type: 'string' },
                    example: ['Jazmín intenso', 'Mandarina', 'Miel silvestre'],
                  },
                },
              },
            },
          },
        },
        responses: {
          '201': { description: 'Ficha guardada en MongoDB y score replicado en PostgreSQL' },
        },
      },
    },
    '/api/calidad/alerta-cuarentena': {
      post: {
        tags: ['Calidad SCA e Inocuidad'],
        summary: 'CASO INTEGRADO: Detonar Protocolo de Alerta Sanitaria y Cuarentena en Cascada',
        description: 'Registra el informe de anomalía en MongoDB, recorre el linaje en Neo4j y bloquea automáticamente en PostgreSQL todos los lotes derivados de la misma parcela.',
        requestBody: {
          required: true,
          content: {
            'application/json': {
              schema: {
                type: 'object',
                required: ['codigo_lote', 'analito', 'resultado_ppm', 'limite_maximo_ppm', 'laboratorio', 'motivo_rechazo'],
                properties: {
                  codigo_lote: { type: 'string', example: 'EXP-2026-CH-05' },
                  analito: { type: 'string', example: 'Glifosato y metabolito AMPA' },
                  resultado_ppm: { type: 'number', example: 0.18 },
                  limite_maximo_ppm: { type: 'number', example: 0.05 },
                  laboratorio: { type: 'string', example: 'Laboratorio Central de Sanidad Fitoquímica' },
                  motivo_rechazo: { type: 'string', example: 'Exceso crítico de residuo plaguicida sobre LMR internacional' },
                },
              },
            },
          },
        },
        responses: {
          '200': {
            description: 'Cuarentena aplicada exitosamente en las 3 bases de datos',
            content: {
              'application/json': {
                example: {
                  success: true,
                  protocolo: 'CUARENTENA_PREVENTIVA_APLICADA',
                  parcela_origen_sospechosa: 'Parcela Kolonté',
                  lotes_bloqueados_count: 1,
                  lotes_bloqueados_ids: [5],
                  codigos_lotes_afectados: ['EXP-2026-CH-05'],
                  contenedores_en_riesgo: [],
                  mensaje: 'Se bloquearon 1 lotes y se emitieron alertas preventivas para contratos y contenedores marítimos.',
                },
              },
            },
          },
        },
      },
    },
  },
};
