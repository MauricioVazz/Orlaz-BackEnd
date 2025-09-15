import { listByUser } from "../../model/favoriteModel.js";

export const getByUserIdFavoriteController = async (req, res) => {
    try {
        const { userId } = req.params;
        const result = await listByUser(+userId);
        res.status(200).json({
            message: "Favoritos do usuário obtidos com sucesso",
            favorites: result
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao obter favoritos do usuário" });
    }
}