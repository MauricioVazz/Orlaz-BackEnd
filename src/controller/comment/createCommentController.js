import { create } from "../../model/commentModel.js";

export const createCommentController = async (req, res) => {
    try {
        // Require authentication and ensure owner
        const requester = req.user || req.userLogged;
        if (!requester) return res.status(401).json({ error: 'Não autorizado' });

        // Normalize and convert numeric fields
        const raw = { ...req.body };
        if (raw.userId !== undefined) raw.userId = Number(raw.userId);
        if (raw.restaurantId !== undefined) raw.restaurantId = raw.restaurantId ? Number(raw.restaurantId) : undefined;
        if (raw.touristSpotId !== undefined) raw.touristSpotId = raw.touristSpotId ? Number(raw.touristSpotId) : undefined;

        // Only allow creating a comment as the authenticated user
        if (Number(requester.id) !== raw.userId) {
            return res.status(403).json({ error: 'Apenas o usuário autenticado pode criar seu comentário' });
        }

        const data = await create(raw);
        return res.status(201).json({ mensagem: 'Comentário criado com sucesso', comment: data });
    } catch (error) {
        console.error('createCommentController error:', error);
        // Validation errors from model contain `details`
        if (error && error.details) {
            return res.status(400).json({ error: 'Dados inválidos', details: error.details });
        }
        // Business not found messages
        if (error && /não encontrado/i.test(error.message)) {
            return res.status(404).json({ error: error.message });
        }
        // Business rule violation (place specified)
        if (error && /Deve ser informado exatamente um dos campos/i.test(error.message)) {
            return res.status(400).json({ error: error.message });
        }

        const payload = { error: 'Erro ao criar comentário' };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        return res.status(500).json(payload);
    }
};