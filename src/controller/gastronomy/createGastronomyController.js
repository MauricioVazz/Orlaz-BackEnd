import { create } from '../../model/gastronomyModel.js';

export const createGastronomyController = async (req, res) => {
    try {
        const gastronomy = req.body;

        if (!gastronomy || Object.keys(gastronomy).length === 0) {
            return res.status(400).json({ error: 'Corpo da requisição vazio.' });
        }

        // If schema requires a top-level imageUrl, set it from the first images entry if missing
        if (!gastronomy.imageUrl && Array.isArray(gastronomy.images) && gastronomy.images.length > 0) {
            gastronomy.imageUrl = gastronomy.images[0].url;
        }

        const data = await create(gastronomy);
        return res.status(201).json({
            mensagem: 'Gastronomia criada com sucesso',
            gastronomy: data
        });
    } catch (error) {
        // Validation errors from model include `details`
        if (error && error.details) {
            return res.status(400).json({ error: error.message || 'Dados inválidos', details: error.details });
        }

        // Conflict / duplicate
        if (error && typeof error.message === 'string' && (error.message.includes('Já existe') || error.message.includes('Conflito'))) {
            return res.status(409).json({ error: error.message });
        }

        console.error('Erro em createGastronomyController:', error);
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(500).json({ error: isProd ? 'Erro ao criar gastronomia' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
    }
};
