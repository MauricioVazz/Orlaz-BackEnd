import { remove, getById } from "../../model/touristSpotModel.js";

export const deleteTouristSpotController = async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const existing = await getById(numericId);
        if (!existing) {
            return res.status(404).json({ error: 'Ponto turístico não encontrado' });
        }

        const result = await remove(numericId);
        return res.status(200).json({ mensagem: 'Ponto turístico deletado com sucesso', result });
    } catch (error) {
        console.error('deleteTouristSpotController error:', error);
        const payload = { error: 'Erro ao deletar ponto turístico' };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        return res.status(500).json(payload);
    }
};
