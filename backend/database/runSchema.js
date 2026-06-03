import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import pg from 'pg';
import '../src/config/loadEnv.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

function getClientConfig() {
  if (process.env.DATABASE_URL) {
    return { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } };
  }
  return {
    host: process.env.DB_HOST,
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME || 'postgres',
    ssl: process.env.DB_SSL !== 'false' ? { rejectUnauthorized: false } : false,
  };
}

async function run() {
  const client = new pg.Client(getClientConfig());
  await client.connect();

  const sql = fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8');
  await client.query(sql);
  await client.end();
  console.log('Schema PostgreSQL aplicado correctamente en Supabase.');
}

run().catch((err) => {
  console.error('Error al aplicar schema:', err.message);
  process.exit(1);
});
