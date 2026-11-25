import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { env } from '../config/env.js';
import { AppError } from '../common/app-error.js';
const userIdSchema = z.string().uuid();
export const authenticate = (request, _response, next) => {
    const authorization = request.header('authorization');
    const match = authorization?.match(/^Bearer\s+(.+)$/i);
    if (!match) {
        next(new AppError(401, 'Autenticação necessária.'));
        return;
    }
    try {
        const payload = jwt.verify(match[1], env.JWT_SECRET, {
            algorithms: ['HS256'],
        });
        const userId = userIdSchema.safeParse(payload.sub);
        if (!userId.success) {
            throw new AppError(401, 'Token inválido.');
        }
        request.auth = { userId: userId.data };
        next();
    }
    catch (error) {
        next(error instanceof AppError ? error : new AppError(401, 'Token inválido ou expirado.'));
    }
};
