import dotenv from 'dotenv';
import path from 'path';
import { z } from 'zod';

// Cargar .env desde la raíz del proyecto si existe, o desde backend
dotenv.config({ path: path.resolve(__dirname, '../../../.env') });
dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(8000),
  HOST: z.string().default('0.0.0.0'),

  // PostgreSQL
  POSTGRES_HOST: z.string().default('localhost'),
  POSTGRES_PORT: z.coerce.number().default(5432),
  POSTGRES_DB: z.string().default('kapeh_trace_db'),
  POSTGRES_USER: z.string().default('kapeh_admin'),
  POSTGRES_PASSWORD: z.string().default('kapeh_secret_2026'),

  // MongoDB
  MONGO_HOST: z.string().default('localhost'),
  MONGO_PORT: z.coerce.number().default(27017),
  MONGO_DB: z.string().default('kapeh_trace_docs'),
  MONGO_USER: z.string().default('kapeh_admin'),
  MONGO_PASSWORD: z.string().default('kapeh_secret_2026'),

  // Neo4j
  NEO4J_HOST: z.string().default('localhost'),
  NEO4J_BOLT_PORT: z.coerce.number().default(7687),
  NEO4J_USER: z.string().default('neo4j'),
  NEO4J_PASSWORD: z.string().default('kapeh_secret_2026'),
});

export const env = envSchema.parse(process.env);
