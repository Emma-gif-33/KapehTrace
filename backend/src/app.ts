import express, { Application, Request, Response } from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import { swaggerDocument } from './docs/swaggerSpec.js';
import { checkDatabaseConnections } from './config/database.js';
import { LotesController } from './controllers/LotesController.js';
import { CalidadController } from './controllers/CalidadController.js';
import { validateBody } from './middleware/validate.js';
import { errorHandler } from './middleware/errorHandler.js';
import {
  CreateLoteSchema,
  CreateMezclaSchema,
  FichaCalidadSchema,
  AlertaCuarentenaSchema,
} from './schemas/lotesSchemas.js';

export function createApp(): Application {
  const app = express();

  // Middlewares globales
  app.use(cors());
  app.use(express.json());

  // Swagger UI Interactivo para la Compañera de Frontend
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

  // Endpoint de Diagnóstico y Healthcheck Políglota
  app.get('/health', async (_req: Request, res: Response) => {
    const dbStatus = await checkDatabaseConnections();
    const allHealthy = dbStatus.postgres && dbStatus.mongodb && dbStatus.neo4j;

    res.status(allHealthy ? 200 : 503).json({
      status: allHealthy ? 'UP' : 'DEGRADED',
      timestamp: new Date().toISOString(),
      architecture: 'Políglota (PostgreSQL + MongoDB + Neo4j)',
      databases: dbStatus,
    });
  });

  // Controladores
  const lotesCtrl = new LotesController();
  const calidadCtrl = new CalidadController();

  // Rutas de Lotes y Trazabilidad Comercial
  app.get('/api/lotes', lotesCtrl.listar);
  app.post('/api/lotes', validateBody(CreateLoteSchema), lotesCtrl.crear);
  app.get('/api/lotes/:id/pasaporte', lotesCtrl.obtenerPasaporte);
  app.post('/api/lotes/mezcla', validateBody(CreateMezclaSchema), lotesCtrl.crearMezcla);
  app.get('/api/lotes/:codigo/grafo', lotesCtrl.obtenerGrafo);

  // Rutas de Calidad e Inocuidad
  app.post('/api/calidad/inspeccion', validateBody(FichaCalidadSchema), calidadCtrl.registrarFicha);
  app.post('/api/calidad/alerta-cuarentena', validateBody(AlertaCuarentenaSchema), calidadCtrl.detonarCuarentena);

  // Middleware de Manejo Centralizado de Errores
  app.use(errorHandler);

  return app;
}
