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
