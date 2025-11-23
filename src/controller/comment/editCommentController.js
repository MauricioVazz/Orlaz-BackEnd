import { getById, update } from "../../model/commentModel.js";

export const editCommentController = async (req, res) => {
    try {
        const { id } = req.params;
        const numericId = Number(id);
        if (!Number.isInteger(numericId) || numericId <= 0) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const comment = await getById(numericId);
        if (!comment) return res.status(404).json({ error: 'Comentário não encontrado' });

        // Normalize input and convert numeric fields
        const body = { ...req.body };
        if (body.userId !== undefined) body.userId = Number(body.userId);
        if (body.restaurantId !== undefined) body.restaurantId = body.restaurantId ? Number(body.restaurantId) : undefined;
        if (body.touristSpotId !== undefined) body.touristSpotId = body.touristSpotId ? Number(body.touristSpotId) : undefined;

        // Ownership: only owner or admin can edit
        const requester = req.user || req.userLogged;
        if (!requester) return res.status(401).json({ error: 'Não autorizado' });
        const requesterId = Number(requester.id);
        const requesterRole = requester.role ? String(requester.role).toUpperCase() : 'USER';
        if (requesterRole !== 'ADMIN' && comment.userId !== requesterId) {
            return res.status(403).json({ error: 'Você só pode editar seu próprio comentário' });
        }

        const result = await update(numericId, body);
        return res.json({ message: 'Comentário atualizado com sucesso', comment: result });
    } catch (error) {
        console.error('editCommentController error:', error);
        if (error && error.details) {
            return res.status(400).json({ error: 'Dados inválidos', details: error.details });
        }
        if (error && /não encontrado/i.test(error.message)) {
            return res.status(404).json({ error: error.message });
        }
        const payload = { error: 'Erro ao atualizar comentário' };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        return res.status(500).json(payload);
    }
};