import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { pool } from './db/pool.js';
import { errorHandler } from './middleware/error-handler.js';
import { authRouter } from './modules/auth/auth.routes.js';
export const app = express();
app.disable('x-powered-by');
app.use(helmet());
app.use(cors({ origin: env.CORS_ORIGIN === '*' ? '*' : env.CORS_ORIGIN }));
app.use(express.json({ limit: '10kb' }));
app.get('/health', async (_request, response, next) => {
    try {
        await pool.query('SELECT 1');
        response.status(200).json({ status: 'ok', database: 'connected' });
    }
    catch (error) {
        next(error);
    }
});
const authLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 20,
    standardHeaders: 'draft-7',
    legacyHeaders: false,
    message: { error: 'Muitas tentativas. Aguarde alguns minutos e tente novamente.' },
});
app.use('/api/v1/auth', authLimiter, authRouter);
app.use((_request, response) => {
    response.status(404).json({ error: 'Rota não encontrada.' });
});
app.use(errorHandler);
