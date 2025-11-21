// import { PrismaClient } from '@prisma/client';
import { PrismaClient } from '../generated/prisma/index.js';
import * as z from 'zod';

const prisma = new PrismaClient();

// Enums
const cityEnum = z.enum(['CARAGUATATUBA', 'UBATUBA', 'SAO_SEBASTIAO', 'ILHABELA']);
const typeEnum = z.enum(['PRAIA', 'URBANO', 'NATUREZA']);

const imageItem = z.object({ url: z.string().url('image url inválida') });

const touristSpotSchema = z.object({
    id: z.number().int().positive().optional(),
    name: z.string({ required_error: 'Nome é obrigatório.' }).min(3, 'O nome deve ter no mínimo 3 caracteres.').max(200, 'Nome muito longo.'),
    description: z.string({ required_error: 'Descrição é obrigatória.' }).min(5, 'Descrição muito curta.').max(2000, 'Descrição muito longa.'),
    city: cityEnum,
    type: typeEnum,
    canFavorite: z.boolean().optional(),
    images: z.array(imageItem).optional()
});

export const validateTouristSpot = (payload, partial = false) => {
    const schema = partial ? touristSpotSchema.partial() : touristSpotSchema;
    const result = schema.safeParse(payload);
    if (result.success) return { success: true, data: result.data };
    const flattened = result.error.flatten();
    return { success: false, errors: flattened.fieldErrors };
};

export const create = async (touristSpot, imagesArg) => {
    // Accept images either in second arg or touristSpot.images
    const payload = { ...touristSpot, images: touristSpot.images ?? imagesArg };
    const validated = validateTouristSpot(payload, false);
    if (!validated.success) {
        const err = new Error('Validation failed');
        err.details = validated.errors;
        throw err;
    }

    const data = {
        name: validated.data.name.trim(),
        description: validated.data.description.trim(),
        city: validated.data.city,
        type: validated.data.type,
        canFavorite: validated.data.canFavorite ?? true
    };

    // require updatedAt on create (schema doesn't have default)
    data.updatedAt = new Date();

    // uniqueness: name + city (case-insensitive)
    const existing = await prisma.$queryRaw`
        SELECT * FROM touristspot
        WHERE LOWER(name) = ${data.name.toLowerCase()}
          AND city = ${data.city}
        LIMIT 1
    `;
    if (Array.isArray(existing) && existing.length > 0) {
        const err = new Error('Já existe um ponto turístico com esse nome nesta cidade.');
        throw err;
    }

    try {
            const created = await prisma.touristspot.create({ data });

        // attach images if present
        if (validated.data.images && validated.data.images.length > 0) {
            const imgs = validated.data.images.map(i => ({ url: i.url, touristSpotId: created.id }));
            await prisma.touristspotimage.createMany({ data: imgs });
        }

        const images = await prisma.touristspotimage.findMany({ where: { touristSpotId: created.id } });
        return { ...created, images };
    } catch (e) {
        if (e && e.code === 'P2002') {
            const err = new Error('Conflito no banco: campo único violado.');
            throw err;
        }
        throw e;
    }
};

export const list = async () => {
    const spots = await prisma.touristspot.findMany();
    if (!spots || spots.length === 0) return [];

    const ids = spots.map(s => s.id);
    const images = await prisma.touristspotimage.findMany({ where: { touristSpotId: { in: ids } } });
    const imagesBySpot = images.reduce((acc, img) => { acc[img.touristSpotId] = acc[img.touristSpotId] || []; acc[img.touristSpotId].push(img); return acc; }, {});
    return spots.map(s => ({ ...s, images: imagesBySpot[s.id] || [] }));
};

// Search with partial match and pagination. Returns { total, items }
export const search = async (options = {}) => {
    const { q, name, city, type, page = 1, limit = 20 } = options;

    const where = {};
    const searchTerm = q || name;
    if (searchTerm) where.name = { contains: String(searchTerm) };
    if (city) where.city = city;
    if (type) where.type = type;

    const take = Number(limit) > 0 ? Number(limit) : 20;
    const skip = (Number(page) > 1 ? (Number(page) - 1) * take : 0);

    const [total, items] = await Promise.all([
        prisma.touristspot.count({ where }),
        prisma.touristspot.findMany({ where, skip, take, orderBy: { createdAt: 'desc' } })
    ]);

    if (!items || items.length === 0) return { total, items: [] };

    const ids = items.map(i => i.id);
    const images = await prisma.touristspotimage.findMany({ where: { touristSpotId: { in: ids } } });
    const imagesBySpot = images.reduce((acc, img) => { acc[img.touristSpotId] = acc[img.touristSpotId] || []; acc[img.touristSpotId].push(img); return acc; }, {});

    const itemsWithImages = items.map(i => ({ ...i, images: imagesBySpot[i.id] || [] }));
    return { total, items: itemsWithImages };
};

export const getById = async (id) => {
    const spot = await prisma.touristspot.findUnique({ where: { id } });
    if (!spot) return null;
    const images = await prisma.touristspotimage.findMany({ where: { touristSpotId: id } });
    return { ...spot, images };
};

export const remove = async (id) => {
    await prisma.touristspotimage.deleteMany({ where: { touristSpotId: id } });
    return await prisma.touristspot.delete({ where: { id } });
};

export const update = async (id, payload) => {
    const validated = validateTouristSpot(payload, true);
    if (!validated.success) {
        const err = new Error('Validation failed');
        err.details = validated.errors;
        throw err;
    }

    const data = {};
    if (validated.data.name !== undefined) data.name = String(validated.data.name).trim();
    if (validated.data.description !== undefined) data.description = String(validated.data.description).trim();
    if (validated.data.city !== undefined) data.city = validated.data.city;
    if (validated.data.type !== undefined) data.type = validated.data.type;
    if (validated.data.canFavorite !== undefined) data.canFavorite = validated.data.canFavorite;

    // Ensure spot exists
    const current = await prisma.touristspot.findUnique({ where: { id } });
    if (!current) {
        const err = new Error('Ponto turístico não encontrado.');
        throw err;
    }

    const finalName = data.name !== undefined ? data.name : current.name;
    const finalCity = data.city !== undefined ? data.city : current.city;

    const conflicting = await prisma.$queryRaw`
        SELECT * FROM touristspot
        WHERE LOWER(name) = ${finalName.toLowerCase()}
          AND city = ${finalCity}
        LIMIT 1
    `;
    if (Array.isArray(conflicting) && conflicting.length > 0 && conflicting[0].id !== id) {
        const err = new Error('Já existe um ponto turístico com esse nome nesta cidade.');
        throw err;
    }

    // If images array provided, replace images
    if (Array.isArray(validated.data.images)) {
        await prisma.touristspotimage.deleteMany({ where: { touristSpotId: id } });
        if (validated.data.images.length > 0) {
            const imgs = validated.data.images.map(i => ({ url: i.url, touristSpotId: id }));
            await prisma.touristspotimage.createMany({ data: imgs });
        }
    }

    try {
        data.updatedAt = new Date();
        return await prisma.touristspot.update({ where: { id }, data });
    } catch (e) {
        if (e && e.code === 'P2002') {
            const err = new Error('Conflito no banco: campo único violado.');
            throw err;
        }
        throw e;
    }
};
