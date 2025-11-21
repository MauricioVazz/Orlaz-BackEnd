import { listByUser } from "../../model/favoriteModel.js";

export const getByUserIdFavoriteController = async (req, res) => {
    try {
        const { userId } = req.params;
        const numericUserId = Number(userId);
        if (!Number.isInteger(numericUserId) || numericUserId <= 0) {
            return res.status(400).json({ error: 'userId inválido' });
        }

        const result = await listByUser(numericUserId);
        return res.status(200).json({ message: 'Favoritos do usuário obtidos com sucesso', favorites: result });
    } catch (error) {
        console.error('getByUserIdFavoriteController error:', error);
        if (error && /inválido/i.test(error.message)) {
            return res.status(400).json({ error: error.message });
        }
        const payload = { error: 'Erro ao obter favoritos do usuário' };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        return res.status(500).json(payload);
    }
}