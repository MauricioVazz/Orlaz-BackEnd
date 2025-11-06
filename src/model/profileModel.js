import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const create = async (user) => {
    return await prisma.user.create({
        data: user
    })
}

export const getById = async (id) => {
    return await prisma.user.findUnique({
        where: { id }
    });
}

export const getAll = async () => {
    return await prisma.user.findMany();
}

export const update = async (id, data) => {
    return await prisma.user.update({
        where: { id },
        data
    });
}

export const remove = async (id) => {
    // Remove dependent records that reference the user to avoid foreign key constraint errors.
    // Currently users can have Favorites (and possibly Comments). Delete those first.
    await prisma.favorite.deleteMany({ where: { userId: id } });
    await prisma.comment.deleteMany({ where: { userId: id } });

    return await prisma.user.delete({
        where: { id }
    });
}