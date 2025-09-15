import { create } from "../../model/favoriteModel.js";

export const createFavoriteController = async (req, res) => {
    try {
        const { userId, placeId } = req.body;
        const result = await create(userId, placeId);
        res.status(201).json({
            message: "Favorito criado com sucesso",
            favorite: result
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar favorito" });
    }
}