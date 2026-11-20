import { createApp } from './app.js';
import { env } from './config/env.js';
import { checkDatabaseConnections, closeDatabaseConnections } from './config/database.js';

const app = createApp();

const server = app.listen(env.PORT, env.HOST, async () => {
  console.log('================================================================');
  console.log(`☕ KapehTrace Backend API REST iniciado exitosamente`);
  console.log(`📡 URL Base:        http://localhost:${env.PORT}`);
  console.log(`📚 Swagger Docs:    http://localhost:${env.PORT}/api-docs`);
  console.log(`🩺 Healthcheck:     http://localhost:${env.PORT}/health`);
  console.log('================================================================');

  const dbStatus = await checkDatabaseConnections();
  console.log('🔌 Estado de Conexión de Persistencia:');
  console.log(`   - PostgreSQL:  ${dbStatus.postgres ? '✅ Conectado' : '⚠️ No disponible'}`);
  console.log(`   - MongoDB:     ${dbStatus.mongodb ? '✅ Conectado' : '⚠️ No disponible'}`);
  console.log(`   - Neo4j:       ${dbStatus.neo4j ? '✅ Conectado' : '⚠️ No disponible'}`);
  console.log('================================================================');
});

// Manejo de señales de terminación elegante
process.on('SIGINT', async () => {
  console.log('\n🛑 Cerrando servidor y pools de bases de datos...');
  server.close(async () => {
    await closeDatabaseConnections();
    console.log('✅ Conexiones cerradas. Servidor apagado limpiamente.');
    process.exit(0);
  });
});

process.on('SIGTERM', async () => {
  server.close(async () => {
    await closeDatabaseConnections();
    process.exit(0);
  });
});
