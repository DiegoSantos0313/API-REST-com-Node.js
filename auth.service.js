import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { AppError } from '../../common/app-error.js';
import { env } from '../../config/env.js';
import { pool } from '../../db/pool.js';
function toPublicUser(row) {
    return {
        id: row.id,
        name: row.name,
        email: row.email,
        createdAt: row.createdAt,
    };
}
function createAccessToken(userId) {
    return jwt.sign({}, env.JWT_SECRET, {
        algorithm: 'HS256',
        subject: userId,
        expiresIn: env.JWT_ACCESS_TOKEN_TTL_SECONDS,
    });
}
export async function register(input) {
    const email = input.email.toLowerCase();
    const passwordHash = await bcrypt.hash(input.password, 12);
    try {
        const result = await pool.query(`INSERT INTO users (name, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, name, email, created_at AS "createdAt",
                 password_hash AS "passwordHash"`, [input.name, email, passwordHash]);
        const user = toPublicUser(result.rows[0]);
        return { user, accessToken: createAccessToken(user.id) };
    }
    catch (error) {
        if (typeof error === 'object' &&
            error !== null &&
            'code' in error &&
            error.code === '23505') {
            throw new AppError(409, 'Já existe uma conta com este e-mail.');
        }
        throw error;
    }
}
export async function login(input) {
    const result = await pool.query(`SELECT id, name, email, created_at AS "createdAt",
            password_hash AS "passwordHash"
     FROM users
     WHERE LOWER(email) = LOWER($1)
     LIMIT 1`, [input.email]);
    const row = result.rows[0];
    if (!row || !(await bcrypt.compare(input.password, row.passwordHash))) {
        throw new AppError(401, 'E-mail ou senha inválidos.');
    }
    const user = toPublicUser(row);
    return { user, accessToken: createAccessToken(user.id) };
}
export async function getProfile(userId) {
    const result = await pool.query(`SELECT id, name, email, created_at AS "createdAt",
            password_hash AS "passwordHash"
     FROM users
     WHERE id = $1`, [userId]);
    if (!result.rows[0]) {
        throw new AppError(404, 'Usuário não encontrado.');
    }
    return toPublicUser(result.rows[0]);
}
export async function updateProfile(userId, name) {
    const result = await pool.query(`UPDATE users
     SET name = $2, updated_at = NOW()
     WHERE id = $1
     RETURNING id, name, email, created_at AS "createdAt",
               password_hash AS "passwordHash"`, [userId, name]);
    if (!result.rows[0]) {
        throw new AppError(404, 'Usuário não encontrado.');
    }
    return toPublicUser(result.rows[0]);
}
