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
    return await prisma.user.delete({
        where: { id }
    });
}