import { ZodError } from 'zod';
import { AppError } from '../common/app-error.js';
export const errorHandler = (error, _request, response, _next) => {
    if (error instanceof AppError) {
        response.status(error.statusCode).json({ error: error.message });
        return;
    }
    if (error instanceof ZodError) {
        response.status(400).json({
            error: 'Dados inválidos.',
            details: error.issues.map((issue) => ({
                field: issue.path.join('.'),
                message: issue.message,
            })),
        });
        return;
    }
    if (error instanceof SyntaxError && 'body' in error) {
        response.status(400).json({ error: 'O corpo da requisição não contém JSON válido.' });
        return;
    }
    console.error('Erro não tratado na API:', error);
    response.status(500).json({ error: 'Erro interno. Tente novamente mais tarde.' });
};
