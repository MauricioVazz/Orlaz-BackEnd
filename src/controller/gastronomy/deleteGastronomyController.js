import { remove } from '../../model/gastronomyModel.js';

export const deleteGastronomyController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await remove(+id);
        res.json({
            message: 'Gastronomia deletada com sucesso',
            result: result
        });
    } catch (error) {
        res.status(500).json({ error: 'Erro ao deletar gastronomia' });
    }
};
