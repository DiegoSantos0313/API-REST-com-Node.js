import { Router } from 'express';
import { z } from 'zod';
import { asyncHandler } from '../../common/async-handler.js';
import { authenticate } from '../../middleware/authenticate.js';
import { login, register, getProfile, updateProfile, } from './auth.service.js';
import { loginSchema, registerSchema, updateProfileSchema, } from './auth.schemas.js';
export const authRouter = Router();
authRouter.post('/register', asyncHandler(async (request, response) => {
    const input = registerSchema.parse(request.body);
    const result = await register(input);
    response.status(201).json(result);
}));
authRouter.post('/login', asyncHandler(async (request, response) => {
    const input = loginSchema.parse(request.body);
    const result = await login(input);
    response.status(200).json(result);
}));
authRouter.get('/me', authenticate, asyncHandler(async (request, response) => {
    const userId = z.string().uuid().parse(request.auth?.userId);
    const user = await getProfile(userId);
    response.status(200).json({ user });
}));
authRouter.patch('/me', authenticate, asyncHandler(async (request, response) => {
    const userId = z.string().uuid().parse(request.auth?.userId);
    const { name } = updateProfileSchema.parse(request.body);
    const user = await updateProfile(userId, name);
    response.status(200).json({ user });
}));
