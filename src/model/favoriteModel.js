import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const create = async (userId, placeId) => {
    return await prisma.favorite.create({
        data: {
            userId,
            placeId
        }
    });
};

export const listByUser = async (userId) => {
    return await prisma.favorite.findMany({
        where: { userId }
    });
};

export const listByPlace = async (placeId) => {
    return await prisma.favorite.findMany({
        where: { placeId }
    });
};

export const remove = async (userId, id) => {
    return await prisma.favorite.delete({
        where: {
            id,
            userId
        }
    });
};