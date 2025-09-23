import { PrismaClient } from '../generated/prisma/index.js';
const prisma = new PrismaClient();

export const create = async (comment) => {
    return await prisma.comment.create({ data: comment });
};

export const getById = async (id) => {
    return await prisma.comment.findUnique({ where: { id } });
};

export const getAll = async (filter = {}) => {
    return await prisma.comment.findMany({ where: filter });
};

export const update = async (id, data) => {
    return await prisma.comment.update({ where: { id }, data });
};

export const remove = async (id) => {
    return await prisma.comment.delete({ where: { id } });
};
