import dotenv from "dotenv";
dotenv.config({ path: ".env.local" });

import { sql } from 'drizzle-orm';

async function resetDb() {
  const { db } = await import('../src/db/index.js');
  console.log('Wiping all records from the database...');
  try {
    await db.execute(sql`
      DO $$ DECLARE
        r RECORD;
      BEGIN
        FOR r IN (SELECT tablename FROM pg_tables WHERE schemaname = 'public') LOOP
          EXECUTE 'TRUNCATE TABLE ' || quote_ident(r.tablename) || ' CASCADE';
        END LOOP;
      END $$;
    `);
    console.log('✅ Success: All records have been cleanly erased!');
    process.exit(0);
  } catch (error) {
    console.error('Failed to wipe database:', error);
    process.exit(1);
  }
}

resetDb();
