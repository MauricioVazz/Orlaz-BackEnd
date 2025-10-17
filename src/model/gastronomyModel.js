import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const create = async (gastronomy) => {
	// Cria gastronomia e imagens associadas
	return await prisma.gastronomy.create({
		data: {
			...gastronomy,
			images: gastronomy.images
				? { create: gastronomy.images }
				: undefined
		},
		include: { images: true }
	});
}

export const getById = async (id) => {
	return await prisma.gastronomy.findUnique({
		where: { id },
		include: { images: true }
	});
}

export const getAll = async () => {
	return await prisma.gastronomy.findMany({
		include: { images: true }
	});
}

export const update = async (id, data) => {
	// Atualiza gastronomia (não atualiza imagens neste exemplo)
	return await prisma.gastronomy.update({
		where: { id },
		data,
		include: { images: true }
	});
}

export const remove = async (id) => {
	return await prisma.gastronomy.delete({
		where: { id }
	});
};
