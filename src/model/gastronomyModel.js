import { PrismaClient } from '../generated/prisma/index.js';

const prisma = new PrismaClient();

export const create = async (gastronomy) => {
	// Cria gastronomia e imagens associadas
	// Cria gastronomia: o schema define apenas imageUrl (string) e não relação images
	// Portanto garantimos que gravamos apenas os campos esperados pelo schema
	const dataToCreate = {
		name: gastronomy.name,
		description: gastronomy.description,
		city: gastronomy.city,
		imageUrl: gastronomy.imageUrl
	};
	return await prisma.gastronomy.create({
		data: dataToCreate
	});
}

export const getById = async (id) => {
	return await prisma.gastronomy.findUnique({
		where: { id }
	});
}

export const getAll = async () => {
	return await prisma.gastronomy.findMany();
}

export const getByCategory = async (city) => {
	return await prisma.gastronomy.findMany({
		where: { city }
	});
}

export const update = async (id, data) => {
	// Atualiza gastronomia (não atualiza imagens neste exemplo)
	return await prisma.gastronomy.update({
		where: { id },
		data
	});
}

export const remove = async (id) => {
	return await prisma.gastronomy.delete({
		where: { id }
	});
};
