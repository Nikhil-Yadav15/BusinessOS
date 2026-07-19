// src/db/index.js
import { drizzle } from 'drizzle-orm/node-postgres';
import pkg from 'pg';
import schema from './schema/index.js'; // Import the unified schema

const { Pool } = pkg;

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  
  // Hard ceiling: max 10 concurrent connections per Next.js instance.
  // Neon poolers handle hundreds of connections, but keeping the client-side
  // localized to 10 prevents single server nodes from hoarding slots.
  max: 10,
  
  // If the database takes longer than 15 seconds to establish a connection,
  // abort it. Protects API routes from hanging indefinitely.
  connectionTimeoutMillis: 15000,
  
  // Close and destroy unused connections after 30 seconds. 
  // Keeps the pool lean and saves Neon compute billing.
  idleTimeoutMillis: 30000,
  
  // Safe default for standard server operation.
  allowExitOnIdle: false,
});

// Explicit error handler to catch unexpected pool socket disconnects cleanly
pool.on('error', (err) => {
  console.error('Unexpected error on idle PostgreSQL client pool connection:', err);
});

// Pass the unified schema and the hardened pool to the Drizzle instance
export const db = drizzle(pool, { schema });