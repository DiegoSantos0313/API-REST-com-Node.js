import { app } from './app.js';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
const server = app.listen(env.PORT, () => {
    console.info(`API disponível em http://localhost:${env.PORT}`);
});
let isShuttingDown = false;
async function shutdown(signal) {
    if (isShuttingDown) {
        return;
    }
    isShuttingDown = true;
    console.info(`Sinal ${signal} recebido. Encerrando a API...`);
    server.close(async (error) => {
        if (error) {
            console.error('Erro ao encerrar o servidor HTTP:', error);
            process.exitCode = 1;
        }
        try {
            await pool.end();
        }
        catch (poolError) {
            console.error('Erro ao encerrar o pool do PostgreSQL:', poolError);
            process.exitCode = 1;
        }
    });
}
process.on('SIGINT', () => void shutdown('SIGINT'));
process.on('SIGTERM', () => void shutdown('SIGTERM'));
