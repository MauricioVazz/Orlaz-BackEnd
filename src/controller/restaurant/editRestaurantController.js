import { update, getById } from "../../model/restaurantModel.js";
import cloudinary from '../../utils/cloudinary.js';
import { PrismaClient } from '../../generated/prisma/index.js';

const prisma = new PrismaClient();

export const editRestaurantController = async (req, res) => {
    try {
        const id = +req.params.id;
        if (!id || Number.isNaN(id)) return res.status(400).json({ error: 'ID inválido.' });

        const restaurant = req.body || {};
        if (Object.keys(restaurant).length === 0 && (!req.files || req.files.length === 0)) {
            return res.status(400).json({ error: 'Corpo da requisição vazio.' });
        }

        // normalize
        if (restaurant.name) restaurant.name = String(restaurant.name).trim();
        if (restaurant.description) restaurant.description = String(restaurant.description).trim();
        if (restaurant.address) restaurant.address = String(restaurant.address).trim();
        if (restaurant.city) restaurant.city = String(restaurant.city).trim();
        if (restaurant.phone) restaurant.phone = String(restaurant.phone).trim();
        if (restaurant.website) restaurant.website = String(restaurant.website).trim();

        // perform update for provided fields first (model handles validation and updatedAt)
        let updatedRestaurant;
        try {
            updatedRestaurant = await update(id, restaurant);
        } catch (err) {
            // validation errors from model include `details`
            if (err && err.details) return res.status(400).json({ error: err.message || 'Dados inválidos', details: err.details });
            if (err && typeof err.message === 'string' && err.message.toLowerCase().includes('não encontrado')) return res.status(404).json({ error: err.message });
            if (err && typeof err.message === 'string' && (err.message.includes('Já existe') || err.message.includes('Conflito'))) return res.status(409).json({ error: err.message });
            throw err;
        }

        // If files were uploaded, upload them to Cloudinary and create restaurantimage rows
        if (req.files && req.files.length > 0) {
            // upload all files
            const uploadPromises = req.files.map(file => new Promise((resolve, reject) => {
                cloudinary.uploader.upload_stream({ folder: 'orlaz/restaurants' }, (error, result) => {
                    if (error) return reject(error);
                    resolve(result.secure_url);
                }).end(file.buffer);
            }));

            let urls;
            try {
                urls = await Promise.all(uploadPromises);
            } catch (uploadErr) {
                console.error('Cloudinary upload error in editRestaurantController:', uploadErr);
                return res.status(502).json({ error: 'Falha ao fazer upload das imagens.' });
            }

            // create restaurantimage records
            try {
                const rows = urls.map(u => ({ url: u, restaurantId: id }));
                await prisma.restaurantimage.createMany({ data: rows });
            } catch (dbErr) {
                console.error('DB error creating restaurant images:', dbErr);
                return res.status(500).json({ error: 'Erro ao salvar imagens.' });
            }
        }

        // fetch final restaurant with images and return
        const final = await getById(id);
        return res.json({ message: 'Restaurante atualizado com sucesso', restaurant: final });
    } catch (error) {
        console.error('Erro em editRestaurantController:', error);
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(500).json({ error: isProd ? 'Erro ao atualizar restaurante' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
    }
};