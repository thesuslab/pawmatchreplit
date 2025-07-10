import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import { migrate } from 'drizzle-orm/node-postgres/migrator';
import 'dotenv/config';
import { seedDatabase } from './server/seed.js';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

async function main() {
  console.log('🔄 Starting database migration...');
  try {
    await migrate(db, { migrationsFolder: './migrations' });
    console.log('✅ Database migration completed successfully!');
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }

  console.log('🌱 Seeding database...');
  try {
    await seedDatabase();
    console.log('✅ Database seeding completed successfully!');
  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }

  await pool.end();
}

main(); 