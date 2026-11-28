import { Pool } from 'pg';
import { MongoClient } from 'mongodb';
import neo4j, { Driver } from 'neo4j-driver';
import { env } from './env.js';

// ============================================================================
// 1. Cliente Relacional: PostgreSQL Pool
// ============================================================================
export const pgPool = new Pool({
  host: env.POSTGRES_HOST,
  port: env.POSTGRES_PORT,
  database: env.POSTGRES_DB,
  user: env.POSTGRES_USER,
  password: env.POSTGRES_PASSWORD,
  max: 15,
  idleTimeoutMillis: 30000,
  connectionTimeoutMillis: 5000,
});

// ============================================================================
// 2. Cliente Documental: MongoDB Native Client
// ============================================================================
const mongoUri = `mongodb://${encodeURIComponent(env.MONGO_USER)}:${encodeURIComponent(env.MONGO_PASSWORD)}@${env.MONGO_HOST}:${env.MONGO_PORT}/${env.MONGO_DB}?authSource=admin`;
export const mongoClient = new MongoClient(mongoUri);
export const getMongoDb = () => mongoClient.db(env.MONGO_DB);

// ============================================================================
// 3. Cliente de Grafos: Neo4j Driver Oficial (Protocolo Bolt)
// ============================================================================
const neo4jBoltUri = `bolt://${env.NEO4J_HOST}:${env.NEO4J_BOLT_PORT}`;
export const neo4jDriver: Driver = neo4j.driver(
  neo4jBoltUri,
  neo4j.auth.basic(env.NEO4J_USER, env.NEO4J_PASSWORD),
  { maxConnectionPoolSize: 20 }
);

// ============================================================================
// Función de Verificación y Diagnóstico de Conexión de las 3 Bases
// ============================================================================
export async function checkDatabaseConnections(): Promise<{
  postgres: boolean;
  mongodb: boolean;
  neo4j: boolean;
}> {
  const status = { postgres: false, mongodb: false, neo4j: false };

  // Test PostgreSQL
  try {
    const res = await pgPool.query('SELECT 1 AS alive');
    status.postgres = (res.rows[0]?.alive === 1);
  } catch (error) {
    console.error('Error conectando a PostgreSQL:', (error as Error).message);
  }

  // Test MongoDB
  try {
    await mongoClient.db(env.MONGO_DB).command({ ping: 1 });
    status.mongodb = true;
  } catch (error) {
    console.error('Error conectando a MongoDB:', (error as Error).message);
  }

  // Test Neo4j
  try {
    const serverInfo = await neo4jDriver.getServerInfo();
    status.neo4j = !!serverInfo.address;
  } catch (error) {
    console.error('Error conectando a Neo4j:', (error as Error).message);
  }

  return status;
}

// Cierre elegante de conexiones
export async function closeDatabaseConnections(): Promise<void> {
  await pgPool.end();
  await mongoClient.close();
  await neo4jDriver.close();
}
