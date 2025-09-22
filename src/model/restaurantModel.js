
import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const create = async (restaurant) => {
	// Cria restaurante e imagens associadas
	return await prisma.restaurant.create({
		data: {
			...restaurant,
			images: restaurant.images
				? { create: restaurant.images }
				: undefined
		},
		include: { images: true }
	});
}

export const getById = async (id) => {
	return await prisma.restaurant.findUnique({
		where: { id },
		include: { images: true }
	});
}

export const getAll = async () => {
	return await prisma.restaurant.findMany({
		include: { images: true }
	});
}

export const update = async (id, data) => {
	// Atualiza restaurante (não atualiza imagens neste exemplo)
	return await prisma.restaurant.update({
		where: { id },
		data,
		include: { images: true }
	});
}

export const remove = async (id) => {
	return await prisma.restaurant.delete({
		where: { id }
	});
}