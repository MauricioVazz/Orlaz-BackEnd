import { PrismaClient } from '../generated/prisma/index.js';
import * as z from 'zod';

const prisma = new PrismaClient();

// Zod schema with clear error messages
const profileSchema = z.object({
    id: z.number().int().positive().optional(),
    name: z.string({ required_error: 'Nome é obrigatório.', invalid_type_error: 'Nome deve ser uma string.' })
        .min(3, 'O nome deve ter no mínimo 3 caracteres.')
        .max(100, 'O nome deve ter no máximo 100 caracteres.'),
    email: z.string({ required_error: 'Email é obrigatório.', invalid_type_error: 'Email deve ser uma string.' })
        .email('Email inválido.'),
    password: z.string({ required_error: 'Senha é obrigatória.', invalid_type_error: 'Senha deve ser uma string.' })
        .min(6, 'A senha deve ter no mínimo 6 caracteres.')
        .max(255, 'A senha deve ter no máximo 255 caracteres.'),
    avatarUrl: z.string().url('A imagem de Avatar deve ser uma URL válida.').nullable().optional(),
    avatarColor: z.string().regex(/^#([0-9a-fA-F]{6})$/, 'avatarColor deve ser uma cor hex válida').optional(),
    role: z.enum(['USER', 'ADMIN']).optional()
});

const randomHex = () => '#' + Math.floor(Math.random() * 16777215).toString(16).padStart(6, '0');

export const validateProfile = (profile, partial = false) => {
    const schema = partial ? profileSchema.partial() : profileSchema;
    const result = schema.safeParse(profile);
    if (result.success) return { success: true, data: result.data };
    const flattened = result.error.flatten();
    return { success: false, errors: flattened.fieldErrors };
};

export const create = async (profile) => {
    const validated = validateProfile(profile, false);
    if (!validated.success) {
        const err = new Error('Validation failed');
        err.details = validated.errors;
        throw err;
    }

    const data = {
        ...validated.data,
        avatarColor: validated.data.avatarColor || randomHex(),
        updatedAt: new Date()
    };

    return await prisma.user.create({
        data,
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            avatarColor: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

export const getById = async (id) => {
    return await prisma.user.findUnique({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            avatarColor: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

export const getAll = async () => {
    return await prisma.user.findMany({
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            avatarColor: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

// Keep full record when fetching by email (used by loginController to check password)
export const getByEmail = async (email) => {
    return await prisma.user.findUnique({
        where: { email }
    });
};

export const update = async (id, profile) => {
    const validated = validateProfile(profile, true);
    if (!validated.success) {
        const err = new Error('Validation failed');
        err.details = validated.errors;
        throw err;
    }

    const data = {
        ...validated.data,
        updatedAt: new Date()
    };

    return await prisma.user.update({
        where: { id },
        data,
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            avatarColor: true,
            role: true,
            createdAt: true,
            updatedAt: true
        }
    });
};

export const remove = async (id) => {
    await prisma.favorite.deleteMany({ where: { userId: id } });
    await prisma.comment.deleteMany({ where: { userId: id } });

    return await prisma.user.delete({
        where: { id },
        select: {
            id: true,
            name: true,
            email: true,
            avatarUrl: true,
            avatarColor: true
        }
    });
};