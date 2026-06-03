import pg from 'pg';
import './loadEnv.js';

const { Pool } = pg;

function buildPoolConfig() {
  if (process.env.DATABASE_URL) {
    return {
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      max: 10,
    };
  }

  const useSsl = process.env.DB_SSL !== 'false';

  return {
    host: process.env.DB_HOST || 'localhost',
    port: Number(process.env.DB_PORT) || 5432,
    user: process.env.DB_USER || 'postgres',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'postgres',
    ssl: useSsl ? { rejectUnauthorized: false } : false,
    max: 10,
  };
}

const pool = new Pool(buildPoolConfig());

function toPgSql(sql) {
  let index = 0;
  return sql.replace(/\?/g, () => `$${++index}`);
}

function isInsert(sql) {
  return /^\s*INSERT\s+/i.test(sql.trim());
}

function isDeleteOrUpdate(sql) {
  return /^\s*(DELETE|UPDATE)\s+/i.test(sql.trim());
}

function withReturningId(sql) {
  if (isInsert(sql) && !/RETURNING\s+/i.test(sql)) {
    return `${sql.trim()} RETURNING id`;
  }
  return sql;
}

async function runQuery(executor, sql, params = []) {
  const pgSql = toPgSql(sql);
  const finalSql = withReturningId(pgSql);
  const result = await executor.query(finalSql, params);

  if (isInsert(sql)) {
    return [{ insertId: result.rows[0]?.id, affectedRows: result.rowCount }];
  }

  if (isDeleteOrUpdate(sql)) {
    return [{ affectedRows: result.rowCount, insertId: 0 }];
  }

  return [result.rows];
}

async function query(sql, params = []) {
  return runQuery(pool, sql, params);
}

async function getConnection() {
  const client = await pool.connect();

  return {
    query: (sql, params) => runQuery(client, sql, params),
    beginTransaction: async () => {
      await client.query('BEGIN');
    },
    commit: async () => {
      await client.query('COMMIT');
    },
    rollback: async () => {
      await client.query('ROLLBACK');
    },
    release: () => client.release(),
  };
}

pool.on('error', (err) => {
  console.error('Error inesperado en el pool de PostgreSQL:', err.message);
});

const db = { query, getConnection, pool };

export default db;
