import { getAll } from '../../model/gastronomyModel.js';

export const getAllGastronomyController = async (req, res) => {
    try {
        const result = await getAll();
        res.json({
            message: 'Gastronomias encontradas com sucesso',
            gastronomies: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao buscar gastronomias' });
    }
};
