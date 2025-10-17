import { update } from '../../model/gastronomyModel.js';

export const editGastronomyController = async (req, res) => {
    try {
        const { id } = req.params;
        const gastronomy = req.body;
        const result = await update(+id, gastronomy);
        res.json({
            message: 'Gastronomia atualizada com sucesso',
            gastronomy: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao atualizar gastronomia' });
    }
};
