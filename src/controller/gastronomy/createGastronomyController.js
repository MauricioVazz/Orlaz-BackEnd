import { create } from '../../model/gastronomyModel.js';

export const createGastronomyController = async (req, res) => {
    try {
        const gastronomy = req.body;
        // If schema requires a top-level imageUrl, set it from the first images entry if missing
        if (!gastronomy.imageUrl && Array.isArray(gastronomy.images) && gastronomy.images.length > 0) {
            gastronomy.imageUrl = gastronomy.images[0].url;
        }
        const data = await create(gastronomy);
        res.status(201).json({
            mensagem: 'Gastronomia criada com sucesso',
            gastronomy: data
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao criar gastronomia' });
    }
};
