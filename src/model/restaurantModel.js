
import { PrismaClient } from '../generated/prisma/index.js';
import * as z from 'zod';

const prisma = new PrismaClient();

// Validation schema for restaurant
const cityEnum = z.enum(['CARAGUATATUBA', 'UBATUBA', 'SAO_SEBASTIAO', 'ILHABELA']);

const imageItem = z.object({ url: z.string().url('image url inválida') });

const restaurantSchema = z.object({
	id: z.number().int().positive().optional(),
	name: z.string({ required_error: 'Nome é obrigatório.' })
		.min(3, 'O nome deve ter no mínimo 3 caracteres.')
		.max(200, 'O nome deve ter no máximo 200 caracteres.'),
	description: z.string({ required_error: 'Descrição é obrigatória.' })
		.min(5, 'A descrição deve ter no mínimo 5 caracteres.')
		.max(2000, 'A descrição é muito longa.'),
	city: cityEnum,
	address: z.string({ required_error: 'Endereço é obrigatório.' })
		.min(3, 'Endereço muito curto.'),
	phone: z.string().optional(),
	// Accept full URLs (http/https) or bare domains like 'www.exemplo.com' and normalize later
	website: z.string().optional().refine((val) => {
		if (val === undefined) return true;
		if (/^https?:\/\//i.test(val)) return true;
		// bare domain like example.com or www.example.com (with optional path/port)
		return /^[\w-]+(\.[\w-]+)+(:\d+)?(\/.*)?$/i.test(val);
	}, 'Website deve ser uma URL válida.'),
	images: z.array(imageItem).optional()
});

export const validateRestaurant = (payload, partial = false) => {
	const schema = partial ? restaurantSchema.partial() : restaurantSchema;
	const result = schema.safeParse(payload);
	if (result.success) return { success: true, data: result.data };
	const flattened = result.error.flatten();
	return { success: false, errors: flattened.fieldErrors };
};

export const create = async (restaurant) => {
	const validated = validateRestaurant(restaurant, false);
	if (!validated.success) {
		const err = new Error('Validation failed');
		err.details = validated.errors;
		throw err;
	}

	// sanitize and build data object (only allowed fields)
	const data = {
		name: validated.data.name.trim(),
		description: validated.data.description.trim(),
		city: validated.data.city,
		address: validated.data.address.trim(),
		phone: validated.data.phone ?? null,
		website: validated.data.website
			? (/^https?:\/\//i.test(validated.data.website) ? validated.data.website : `https://${validated.data.website}`)
			: null
	};
	// Prisma schema requires updatedAt to be provided on create (no default)
	data.updatedAt = new Date();

	// Check uniqueness: same name in same city (case-insensitive)
	const existing = await prisma.$queryRaw`
		SELECT * FROM restaurant
		WHERE LOWER(name) = ${data.name.toLowerCase()}
			AND city = ${data.city}
		LIMIT 1
	`;
	if (Array.isArray(existing) && existing.length > 0) {
		const err = new Error('Já existe um restaurante com esse nome nesta cidade.');
		throw err;
	}

	try {
		// create restaurant first
		const created = await prisma.restaurant.create({ data });

		// if images provided, create separate restaurantimage records
		if (validated.data.images && Array.isArray(validated.data.images) && validated.data.images.length > 0) {
			const imagesToCreate = validated.data.images.map(img => ({ url: img.url, restaurantId: created.id }));
			await prisma.restaurantimage.createMany({ data: imagesToCreate });
		}

		// fetch images and return combined object
		const images = await prisma.restaurantimage.findMany({ where: { restaurantId: created.id } });
		return { ...created, images };
	} catch (e) {
		if (e && e.code === 'P2002') {
			const err = new Error('Conflito no banco: campo único violado.');
			throw err;
		}
		throw e;
	}
};

export const getById = async (id) => {
	const restaurant = await prisma.restaurant.findUnique({ where: { id } });
	if (!restaurant) return null;
	const images = await prisma.restaurantimage.findMany({ where: { restaurantId: id } });
	return { ...restaurant, images };
};

export const getAll = async () => {
	const restaurants = await prisma.restaurant.findMany();
	if (!restaurants || restaurants.length === 0) return [];

	const ids = restaurants.map(r => r.id);
	const images = await prisma.restaurantimage.findMany({ where: { restaurantId: { in: ids } } });

	// group images by restaurantId
	const imagesByRestaurant = images.reduce((acc, img) => {
		acc[img.restaurantId] = acc[img.restaurantId] || [];
		acc[img.restaurantId].push(img);
		return acc;
	}, {});

	return restaurants.map(r => ({ ...r, images: imagesByRestaurant[r.id] || [] }));
};

export const update = async (id, payload) => {
	const validated = validateRestaurant(payload, true);
	if (!validated.success) {
		const err = new Error('Validation failed');
		err.details = validated.errors;
		throw err;
	}

	// build update object with allowed fields
	const data = {};
	if (validated.data.name !== undefined) data.name = String(validated.data.name).trim();
	if (validated.data.description !== undefined) data.description = String(validated.data.description).trim();
	if (validated.data.city !== undefined) data.city = validated.data.city;
	if (validated.data.address !== undefined) data.address = String(validated.data.address).trim();
	if (validated.data.phone !== undefined) data.phone = validated.data.phone;
	if (validated.data.website !== undefined) {
		data.website = validated.data.website ? (/^https?:\/\//i.test(validated.data.website) ? validated.data.website : `https://${validated.data.website}`) : null;
	}

	// If images provided, we won't modify them here; keep separate endpoint for images

	// Ensure restaurant exists
	const current = await prisma.restaurant.findUnique({ where: { id } });
	if (!current) {
		const err = new Error('Restaurante não encontrado.');
		throw err;
	}

	const finalName = data.name !== undefined ? data.name : current.name;
	const finalCity = data.city !== undefined ? data.city : current.city;

	// Check uniqueness with final values
	const conflicting = await prisma.$queryRaw`
		SELECT * FROM restaurant
		WHERE LOWER(name) = ${finalName.toLowerCase()}
			AND city = ${finalCity}
		LIMIT 1
	`;
	if (Array.isArray(conflicting) && conflicting.length > 0 && conflicting[0].id !== id) {
		const err = new Error('Já existe um restaurante com esse nome nesta cidade.');
		throw err;
	}

	try {
		// update timestamp
		data.updatedAt = new Date();
		return await prisma.restaurant.update({ where: { id }, data });
	} catch (e) {
		if (e && e.code === 'P2002') {
			const err = new Error('Conflito no banco: campo único violado.');
			throw err;
		}
		throw e;
	}
};

export const remove = async (id) => {
	// Remove imagens associadas primeiro para evitar FK issues
	await prisma.restaurantimage.deleteMany({ where: { restaurantId: id } });
	return await prisma.restaurant.delete({ where: { id } });
};