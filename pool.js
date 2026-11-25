import pg from 'pg';
import { env } from '../config/env.js';
const { Pool } = pg;
export const pool = new Pool({
    connectionString: env.DATABASE_URL,
    connectionTimeoutMillis: 5000,
    idleTimeoutMillis: 30000,
    max: 10,
});
pool.on('error', (error) => {
    console.error('Erro inesperado em uma conexão ociosa do PostgreSQL:', error);
});
