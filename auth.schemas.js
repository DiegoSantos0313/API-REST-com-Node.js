import { z } from 'zod';
const passwordSchema = z
    .string()
    .min(8, 'A senha deve ter pelo menos 8 caracteres.')
    .refine((value) => Buffer.byteLength(value, 'utf8') <= 72, {
    message: 'A senha não pode exceder 72 bytes.',
});
export const registerSchema = z.object({
    name: z.string().trim().min(2).max(100),
    email: z.string().trim().email().max(254),
    password: passwordSchema,
});
export const loginSchema = z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1),
});
export const updateProfileSchema = z.object({
    name: z.string().trim().min(2).max(100),
});
