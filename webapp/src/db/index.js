// src/db/index.js
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import schema from './schema/index.js'; // Import the unified schema

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
});

// Pass the unified schema to the Drizzle instance
export const db = drizzle(pool, { schema });