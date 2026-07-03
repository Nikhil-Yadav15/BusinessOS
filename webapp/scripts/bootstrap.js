
// It is meant to be run once when provisioning the database, or manually if you update a specific RLS policy.
import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { Pool } = pkg;

async function bootstrapDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('Applying Physical Database Architecture (Raw SQL)...');
  
  // Order matters here! Roles -> Functions -> Policies -> Triggers
  const sqlDirectories = [
    './src/db/sql/roles',
    './src/db/sql/functions',
    './src/db/sql/policies',
    './src/db/sql/triggers',
    './src/db/sql/views'
  ];

  for (const dir of sqlDirectories) {
    if (!fs.existsSync(dir)) continue;
    
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      console.log(`Executing ${file}...`);
      const sqlContent = fs.readFileSync(path.join(dir, file), 'utf-8');
      await pool.query(sqlContent);
    }
  }

  console.log('Database architecture successfully bootstrapped.');
  await pool.end();
}

bootstrapDatabase().catch((err) => {
  console.error('Bootstrap failed:', err);
  process.exit(1);
});