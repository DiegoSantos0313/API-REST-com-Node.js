import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import pg from 'pg';
import { env } from '../config/env.js';
const { Pool } = pg;
const pool = new Pool({ connectionString: env.DATABASE_URL });
const migrationPath = fileURLToPath(new URL('./migrations/001_create_users.sql', import.meta.url));
async function migrate() {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');
        await client.query(`
      CREATE TABLE IF NOT EXISTS schema_migrations (
        name VARCHAR(255) PRIMARY KEY,
        applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      )
    `);
        const migrationName = '001_create_users';
        const existing = await client.query('SELECT 1 FROM schema_migrations WHERE name = $1', [migrationName]);
        if (existing.rowCount === 0) {
            const migrationSql = await readFile(migrationPath, 'utf8');
            await client.query(migrationSql);
            await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [migrationName]);
            console.info(`Migração aplicada: ${migrationName}`);
        }
        else {
            console.info('Banco de dados já está atualizado.');
        }
        await client.query('COMMIT');
    }
    catch (error) {
        await client.query('ROLLBACK');
        throw error;
    }
    finally {
        client.release();
        await pool.end();
    }
}
migrate().catch((error) => {
    console.error('Falha ao executar as migrações:', error);
    process.exitCode = 1;
});
