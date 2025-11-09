// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const create = async (touristSpot, images) => {
    return await prisma.touristSpot.create({
        data: {
            name: touristSpot.name,
            description: touristSpot.description,
            city: touristSpot.city,
            type: touristSpot.type,
            canFavorite: touristSpot.canFavorite ?? true,
            images: {
                create: images.map(url => ({ url }))
            }
        },
        include: { images: true }
    });
};

export const list = async () => {
    return await prisma.touristSpot.findMany({
        include: { images: true }
    });
};

// Search with partial match and pagination. Returns { total, items }
export const search = async (options = {}) => {
    const { q, name, city, type, page = 1, limit = 20 } = options;

    const where = {};
    const searchTerm = q || name;
    if (searchTerm) {
        // Use partial match. Note: some Prisma versions or providers don't support `mode: 'insensitive'`.
        // The database collation often controls case-sensitivity. Remove `mode` for compatibility.
        where.name = { contains: String(searchTerm) };
    }
    if (city) where.city = city;
    if (type) where.type = type;

    const take = Number(limit) > 0 ? Number(limit) : 20;
    const skip = (Number(page) > 1 ? (Number(page) - 1) * take : 0);

    const [total, items] = await Promise.all([
        prisma.touristSpot.count({ where }),
        prisma.touristSpot.findMany({ where, include: { images: true }, skip, take, orderBy: { createdAt: 'desc' } })
    ]);

    return { total, items };
};

export const getById = async (id) => {
    return await prisma.touristSpot.findUnique({
        where: { id },
        include: { images: true }
    });
};

export const remove = async (id) => {
    // Deleta todas as imagens relacionadas ao ponto turístico
    await prisma.touristSpotImage.deleteMany({ where: { touristSpotId: id } });
    // Agora deleta o ponto turístico
    return await prisma.touristSpot.delete({
        where: { id }
    });
};

export const update = async (id, data) => {
    // Se vier images como array de strings, faz a troca completa das imagens
    if (Array.isArray(data.images)) {
        // Deleta todas as imagens antigas
        await prisma.touristSpotImage.deleteMany({ where: { touristSpotId: id } });
        // Cria as novas imagens
        data.images = {
            create: data.images.map(url => ({ url }))
        };
    }
    return await prisma.touristSpot.update({
        where: { id },
        data,
        include: { images: true }
    });
};
