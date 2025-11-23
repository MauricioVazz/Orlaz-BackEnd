import { create } from "../../model/favoriteModel.js";

export const createFavoriteController = async (req, res) => {
    try {
        const requester = req.user || req.userLogged;
        if (!requester) return res.status(401).json({ error: 'Não autorizado' });

        let { userId, placeId } = req.body;
        userId = Number(userId);
        placeId = Number(placeId);

        // only allow creating favorite for yourself
        if (Number(requester.id) !== userId) {
            return res.status(403).json({ error: 'Apenas o usuário dono pode criar seus favoritos' });
        }

        const result = await create(userId, placeId);
        return res.status(201).json({ message: 'Favorito criado com sucesso', favorite: result });
    } catch (error) {
        console.error('createFavoriteController error:', error);
        // Validation from model contains `details`
        if (error && error.details) {
            return res.status(400).json({ error: 'Dados inválidos', details: error.details });
        }
        // Not found messages
        if (error && /não encontrado/i.test(error.message)) {
            return res.status(404).json({ error: error.message });
        }
        // Duplicate / conflict
        if (error && (/já existe/i.test(error.message) || error.code === 'P2002')) {
            return res.status(409).json({ error: error.message });
        }

        const payload = { error: 'Erro ao criar favorito' };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        return res.status(500).json(payload);
    }
};