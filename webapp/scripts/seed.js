// inserts the initial data required for the platform to function.
import pkg from 'pg';
import fs from 'fs';
import path from 'path';
import 'dotenv/config';
import dotenv from "dotenv";

dotenv.config({ path: ".env.local" });

const { Pool } = pkg;

async function seedDatabase() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });

  console.log('Seeding initial platform data...');
  
  const seedDir = './src/db/sql/seed';
  if (fs.existsSync(seedDir)) {
    const files = fs.readdirSync(seedDir).filter(f => f.endsWith('.sql')).sort();
    for (const file of files) {
      console.log(`Executing ${file}...`);
      const sqlContent = fs.readFileSync(path.join(seedDir, file), 'utf-8');
      await pool.query(sqlContent);
    }
  }

  console.log('Database seeded successfully.');
  await pool.end();
}

seedDatabase().catch((err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});