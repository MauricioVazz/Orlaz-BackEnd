import { getById } from '../../model/gastronomyModel.js';

export const getByIdGastronomyController = async (req, res) => {
    try {
        const id = +req.params.id;
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const result = await getById(id);
        if (!result) {
            return res.status(404).json({ error: 'Gastronomia não encontrada.' });
        }

        return res.json({
            message: 'Gastronomia encontrada com sucesso',
            gastronomy: result
        });
    } catch (error) {
        console.error('Erro em getByIdGastronomyController:', error);
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(500).json({ error: isProd ? 'Erro ao buscar gastronomia' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
    }
};
