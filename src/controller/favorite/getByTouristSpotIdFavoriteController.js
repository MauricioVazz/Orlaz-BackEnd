import { listByPlace } from "../../model/favoriteModel.js";

export const getByTouristSpotIdFavoriteController = async (req, res) => {
    try {
        const { placeId } = req.params;
        const numericPlaceId = Number(placeId);
        if (!Number.isInteger(numericPlaceId) || numericPlaceId <= 0) {
            return res.status(400).json({ error: 'placeId inválido' });
        }

        const result = await listByPlace(numericPlaceId);
        return res.status(200).json({ message: 'Quantidade de favoritos do ponto turístico obtida com sucesso', count: result.length });
    } catch (error) {
        console.error('getByTouristSpotIdFavoriteController error:', error);
        if (error && /inválido/i.test(error.message)) {
            return res.status(400).json({ error: error.message });
        }
        const payload = { error: 'Erro ao obter quantidade de favoritos do ponto turístico' };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        return res.status(500).json(payload);
    }
}