import { getById } from '../../model/gastronomyModel.js';

export const getByIdGastronomyController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getById(+id);
        res.json({
            message: 'Gastronomia encontrada com sucesso',
            gastronomy: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar gastronomia' });
    }
};
