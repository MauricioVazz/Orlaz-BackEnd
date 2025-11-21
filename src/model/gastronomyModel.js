import { PrismaClient } from '../generated/prisma/index.js';
import * as z from 'zod';

const prisma = new PrismaClient();

// Enum values must match the Prisma enum `gastronomy_city`
const cityEnum = z.enum(['CARAGUATATUBA', 'UBATUBA', 'SAO_SEBASTIAO', 'ILHABELA']);

const gastronomySchema = z.object({
	id: z.number().int().positive().optional(),
	name: z.string({ required_error: 'Nome é obrigatório.' })
		.min(3, 'O nome deve ter no mínimo 3 caracteres.')
		.max(200, 'O nome deve ter no máximo 200 caracteres.'),
	description: z.string({ required_error: 'Descrição é obrigatória.' })
		.min(5, 'A descrição deve ter no mínimo 5 caracteres.')
		.max(2000, 'A descrição é muito longa.'),
	imageUrl: z.string({ required_error: 'imageUrl é obrigatório.' })
		.url('imageUrl deve ser uma URL válida.'),
	city: cityEnum
});

export const validateGastronomy = (payload, partial = false) => {
	const schema = partial ? gastronomySchema.partial() : gastronomySchema;
	const result = schema.safeParse(payload);
	if (result.success) return { success: true, data: result.data };
	const flattened = result.error.flatten();
	return { success: false, errors: flattened.fieldErrors };
};

// Business rules applied:
// - `name` + `city` must be unique (no duplicate restaurants in same city)
// - Only allowed fields are saved (sanitization)
// - Validation errors provide structured messages

export const create = async (gastronomy) => {
	const validated = validateGastronomy(gastronomy, false);
	if (!validated.success) {
		const err = new Error('Validation failed');
		err.details = validated.errors;
		throw err;
	}

	const data = {
		name: validated.data.name,
		description: validated.data.description,
		imageUrl: validated.data.imageUrl,
		city: validated.data.city
	};

	// Check uniqueness: same name in the same city
	// Use case-insensitive comparison for name to avoid duplicates like 'X' vs 'x'
	// Prisma `mode: 'insensitive'` may not be available for this connector/version,
	// so use a parametrized raw SQL query with LOWER(name) for MySQL.
	const existing = await prisma.$queryRaw`
		SELECT * FROM gastronomy
		WHERE LOWER(name) = ${data.name.toLowerCase()}
		  AND city = ${data.city}
		LIMIT 1
	`;
	if (Array.isArray(existing) && existing.length > 0) {
		const err = new Error('Já existe uma gastronomia com esse nome nesta cidade.');
		throw err;
	}

	try {
		return await prisma.gastronomy.create({ data });
	} catch (e) {
		if (e && e.code === 'P2002') {
			const err = new Error('Conflito no banco: campo único violado.');
			throw err;
		}
		throw e;
	}
};

export const getById = async (id) => {
	return await prisma.gastronomy.findUnique({ where: { id } });
};

export const getAll = async () => {
	return await prisma.gastronomy.findMany();
};

export const getByCategory = async (city) => {
	// Validate city value before querying
	const cityCheck = cityEnum.safeParse(city);
	if (!cityCheck.success) {
		const err = new Error('Cidade inválida.');
		throw err;
	}
	return await prisma.gastronomy.findMany({ where: { city } });
};

export const update = async (id, payload) => {
	const validated = validateGastronomy(payload, true);
	if (!validated.success) {
		const err = new Error('Validation failed');
		err.details = validated.errors;
		throw err;
	}

	// Build update object with allowed fields only
	const data = {};
	if (validated.data.name !== undefined) data.name = validated.data.name;
	if (validated.data.description !== undefined) data.description = validated.data.description;
	if (validated.data.imageUrl !== undefined) data.imageUrl = validated.data.imageUrl;
	if (validated.data.city !== undefined) data.city = validated.data.city;

	// If name or city may change, load current record to compute the final (name,city)
	const current = await prisma.gastronomy.findUnique({ where: { id } });
	if (!current) {
		const err = new Error('Gastronomia não encontrada.');
		throw err;
	}

	const finalName = data.name !== undefined ? data.name : current.name;
	const finalCity = data.city !== undefined ? data.city : current.city;

	// Check uniqueness using final values (case-insensitive name)
	const conflicting = await prisma.$queryRaw`
		SELECT * FROM gastronomy
		WHERE LOWER(name) = ${finalName.toLowerCase()}
		  AND city = ${finalCity}
		LIMIT 1
	`;
	if (Array.isArray(conflicting) && conflicting.length > 0 && conflicting[0].id !== id) {
		const err = new Error('Já existe uma gastronomia com esse nome nesta cidade.');
		throw err;
	}

	try {
		return await prisma.gastronomy.update({ where: { id }, data });
	} catch (e) {
		if (e && e.code === 'P2002') {
			const err = new Error('Conflito no banco: campo único violado.');
			throw err;
		}
		throw e;
	}
};

export const remove = async (id) => {
	return await prisma.gastronomy.delete({ where: { id } });
};
