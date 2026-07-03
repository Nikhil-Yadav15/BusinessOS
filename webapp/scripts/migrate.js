// applies Drizzle schema changes
import { drizzle } from 'drizzle-orm/node-postgres';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import pkg from 'pg';
import 'dotenv/config';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { Pool } = pkg;

async function runMigrations() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);

  console.log('Running Drizzle structural migrations...');
  await migrate(db, { migrationsFolder: './drizzle' });
  
  console.log('Schema migrations applied successfully.');
  await pool.end();
}

runMigrations().catch((err) => {
  console.error('Migration failed:', err);
  process.exit(1);
});