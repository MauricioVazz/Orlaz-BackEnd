import { PrismaClient } from '../generated/prisma/index.js';
import * as z from 'zod';

const prisma = new PrismaClient();

const commentSchema = z.object({
    id: z.number().int().positive().optional(),
    content: z.string({ required_error: 'Conteúdo é obrigatório.' }).min(1, 'Conteúdo muito curto').max(2000, 'Conteúdo muito longo'),
    userId: z.number({ required_error: 'userId é obrigatório.' }).int().positive(),
    restaurantId: z.number().int().positive().optional(),
    touristSpotId: z.number().int().positive().optional()
});

const validateComment = (payload, partial = false) => {
    const schema = partial ? commentSchema.partial() : commentSchema;
    const result = schema.safeParse(payload);
    if (result.success) return { success: true, data: result.data };
    const flattened = result.error.flatten();
    return { success: false, errors: flattened.fieldErrors };
};

const ensurePlaceSpecified = (data) => {
    const hasRestaurant = data.restaurantId !== undefined && data.restaurantId !== null;
    const hasTourist = data.touristSpotId !== undefined && data.touristSpotId !== null;
    if (hasRestaurant === hasTourist) {
        // either both present or both absent -> invalid
        const err = new Error('Deve ser informado exatamente um dos campos: restaurantId ou touristSpotId.');
        throw err;
    }
};

export const create = async (comment) => {
    const validated = validateComment(comment, false);
    if (!validated.success) {
        const err = new Error('Validation failed');
        err.details = validated.errors;
        throw err;
    }

    // business rule: exactly one place id
    try {
        ensurePlaceSpecified(validated.data);
    } catch (e) {
        throw e;
    }

    // ensure user exists
    const user = await prisma.user.findUnique({ where: { id: validated.data.userId } });
    if (!user) {
        const err = new Error('Usuário não encontrado.');
        throw err;
    }

    // ensure place exists
    if (validated.data.restaurantId) {
        const r = await prisma.restaurant.findUnique({ where: { id: validated.data.restaurantId } });
        if (!r) {
            const err = new Error('Restaurante (restaurantId) não encontrado.');
            throw err;
        }
    } else if (validated.data.touristSpotId) {
        const t = await prisma.touristspot.findUnique({ where: { id: validated.data.touristSpotId } });
        if (!t) {
            const err = new Error('Ponto turístico (touristSpotId) não encontrado.');
            throw err;
        }
    }

    const data = {
        content: validated.data.content.trim(),
        userId: validated.data.userId,
        restaurantId: validated.data.restaurantId ?? null,
        touristSpotId: validated.data.touristSpotId ?? null,
        updatedAt: new Date()
    };

    return await prisma.comment.create({ data });
};

export const getById = async (id) => {
    if (!Number.isInteger(Number(id)) || Number(id) <= 0) return null;
    return await prisma.comment.findUnique({ where: { id: Number(id) } });
};

export const getAll = async (filter = {}) => {
    // Accept filter with userId, restaurantId, touristSpotId
    const where = {};
    if (filter.userId !== undefined) where.userId = Number(filter.userId);
    if (filter.restaurantId !== undefined) where.restaurantId = Number(filter.restaurantId);
    if (filter.touristSpotId !== undefined) where.touristSpotId = Number(filter.touristSpotId);
    return await prisma.comment.findMany({ where });
};

export const listByUser = async (userId) => {
    if (!Number.isInteger(Number(userId)) || Number(userId) <= 0) throw new Error('userId inválido');
    return await prisma.comment.findMany({ where: { userId: Number(userId) } });
};

export const listByPlace = async (placeId) => {
    if (!Number.isInteger(Number(placeId)) || Number(placeId) <= 0) throw new Error('placeId inválido');
    // search both restaurantId and touristSpotId
    return await prisma.comment.findMany({ where: { OR: [{ restaurantId: Number(placeId) }, { touristSpotId: Number(placeId) }] } });
};

export const update = async (id, payload) => {
    const validated = validateComment(payload, true);
    if (!validated.success) {
        const err = new Error('Validation failed');
        err.details = validated.errors;
        throw err;
    }

    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
        const err = new Error('id inválido');
        throw err;
    }

    const current = await prisma.comment.findUnique({ where: { id: numericId } });
    if (!current) {
        const err = new Error('Comentário não encontrado.');
        throw err;
    }

    // If both place ids are being modified, or none, ensure business rule still holds
    const merged = { ...current, ...validated.data };
    try {
        ensurePlaceSpecified(merged);
    } catch (e) {
        throw e;
    }

    const data = {};
    if (validated.data.content !== undefined) data.content = String(validated.data.content).trim();
    if (validated.data.userId !== undefined) data.userId = validated.data.userId;
    if (validated.data.restaurantId !== undefined) data.restaurantId = validated.data.restaurantId;
    if (validated.data.touristSpotId !== undefined) data.touristSpotId = validated.data.touristSpotId;
    data.updatedAt = new Date();

    return await prisma.comment.update({ where: { id: numericId }, data });
};

export const remove = async (id) => {
    const numericId = Number(id);
    if (!Number.isInteger(numericId) || numericId <= 0) {
        const err = new Error('id inválido');
        throw err;
    }
    // ensure exists
    const existing = await prisma.comment.findUnique({ where: { id: numericId } });
    if (!existing) {
        const err = new Error('Comentário não encontrado.');
        throw err;
    }
    return await prisma.comment.delete({ where: { id: numericId } });
};
