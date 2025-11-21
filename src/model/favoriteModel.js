import { PrismaClient } from '../generated/prisma/index.js';
import * as z from 'zod';

const prisma = new PrismaClient();

const favoriteSchema = z.object({
    id: z.number().int().positive().optional(),
    userId: z.number({ required_error: 'userId é obrigatório' }).int().positive(),
    placeId: z.number({ required_error: 'placeId é obrigatório' }).int().positive()
});

export const validateFavorite = (payload, partial = false) => {
    const schema = partial ? favoriteSchema.partial() : favoriteSchema;
    const result = schema.safeParse(payload);
    if (result.success) return { success: true, data: result.data };
    const flattened = result.error.flatten();
    return { success: false, errors: flattened.fieldErrors };
};

export const create = async (userId, placeId) => {
    const payload = { userId, placeId };
    const validated = validateFavorite(payload, false);
    if (!validated.success) {
        const err = new Error('Validation failed');
        err.details = validated.errors;
        throw err;
    }

    // Ensure user exists
    const user = await prisma.user.findUnique({ where: { id: validated.data.userId } });
    if (!user) {
        const err = new Error('Usuário não encontrado.');
        throw err;
    }

    // Ensure place exists in at least one of the supported tables
    const placeRestaurant = await prisma.restaurant.findUnique({ where: { id: validated.data.placeId } });
    const placeTouristSpot = await prisma.touristspot.findUnique({ where: { id: validated.data.placeId } });
    if (!placeRestaurant && !placeTouristSpot) {
        const err = new Error('Local (placeId) não encontrado.');
        throw err;
    }

    // check duplicate
    const existing = await prisma.favorite.findFirst({ where: { userId: validated.data.userId, placeId: validated.data.placeId } });
    if (existing) {
        const err = new Error('Favorito já existe para este usuário e local.');
        throw err;
    }

    try {
        return await prisma.favorite.create({ data: { userId: validated.data.userId, placeId: validated.data.placeId } });
    } catch (e) {
        if (e && e.code === 'P2002') {
            const err = new Error('Conflito no banco: favorito já existe.');
            throw err;
        }
        throw e;
    }
};

export const getById = async (id) => {
    return await prisma.favorite.findUnique({ where: { id } });
};

export const listByUser = async (userId) => {
    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
        const err = new Error('userId inválido');
        throw err;
    }
    return await prisma.favorite.findMany({ where: { userId: Number(userId) } });
};

export const listByPlace = async (placeId) => {
    if (!Number.isInteger(Number(placeId)) || Number(placeId) <= 0) {
        const err = new Error('placeId inválido');
        throw err;
    }
    return await prisma.favorite.findMany({ where: { placeId: Number(placeId) } });
};

export const remove = async (id, userId) => {
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) {
        const err = new Error('id inválido');
        throw err;
    }
    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) {
        const err = new Error('userId inválido');
        throw err;
    }

    // deleteMany returns { count }
    return await prisma.favorite.deleteMany({ where: { id: Number(id), userId: Number(userId) } });
};