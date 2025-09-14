import dotenv from 'dotenv';
import { Pool } from 'pg';

dotenv.config();

const pool = new Pool({
  user: process.env.POSTGRES_USER || process.env.DB_USER,
  host: process.env.DB_HOST || 'localhost',
  database: process.env.POSTGRES_DB || process.env.DB_DATABASE,
  password: process.env.POSTGRES_PASSWORD || process.env.DB_PASSWORD,
  port: parseInt(process.env.DB_PORT) || 5432,
  max: parseInt(process.env.DB_MAX_CLIENTS) || 5,
  idleTimeoutMillis: parseInt(process.env.DB_IDLE_TIMEOUT) || 30000,
  connectionTimeoutMillis: 2000,
});

pool.on('error', (err) => {
  console.error('Unexpected error on idle client', err);
  process.exit(-1);
});

pool.on('connect', (client) => {
  console.log('✅ Connected to PostgreSQL database');
});

export default pool;
