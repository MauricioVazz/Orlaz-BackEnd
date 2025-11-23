import { remove, getById } from "../../model/favoriteModel.js";

export const deleteFavoriteController = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const numericId = Number(id);
        const numericUserId = Number(userId);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            return res.status(400).json({ error: 'id inválido' });
        }
        if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
            return res.status(400).json({ error: 'userId inválido' });
        }

        const existing = await getById(numericId);
        if (!existing) {
            return res.status(404).json({ error: 'Favorito não encontrado' });
        }

        // ownership check: only the owner (no admin override) can delete
        const requester = req.user || req.userLogged;
        if (!requester) return res.status(401).json({ error: 'Não autorizado' });
        if (Number(requester.id) !== numericUserId) {
            return res.status(403).json({ error: 'Não autorizado a deletar este favorito' });
        }

        const result = await remove(numericId, numericUserId);
        return res.status(200).json({ message: 'Favorito deletado com sucesso', result });
    } catch (error) {
        console.error('deleteFavoriteController error:', error);
        const payload = { error: 'Erro ao deletar favorito' };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        return res.status(500).json(payload);
    }
}