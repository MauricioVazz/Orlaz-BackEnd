import { getById, remove } from "../../model/commentModel.js";

export const deleteCommentController = async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const comment = await getById(numericId);
        if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });

        // Ownership: prefer authenticated user id (req.user.id), otherwise accept body.userId for testing
        const requesterId = (req.user && req.user.id) ? Number(req.user.id) : (req.body && req.body.userId ? Number(req.body.userId) : null);
        if (!requesterId || comment.userId !== requesterId) {
            return res.status(403).json({ error: 'Você só pode deletar seu próprio comentário' });
        }

        const result = await remove(numericId);
        return res.status(200).json({ message: 'Comentário deletado com sucesso', result });
    } catch (error) {
        console.error('deleteCommentController error:', error);
        if (error && /inválido/i.test(error.message)) {
            return res.status(400).json({ error: error.message });
        }
        if (error && /não encontrado/i.test(error.message)) {
            return res.status(404).json({ error: error.message });
        }
        const payload = { error: 'Erro ao deletar comentário' };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        return res.status(500).json(payload);
    }
};