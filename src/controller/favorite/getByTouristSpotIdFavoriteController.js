import { listByPlace } from "../../model/favoriteModel.js";

export const getByTouristSpotIdFavoriteController = async (req, res) => {
    try {
        const { placeId } = req.params;
        const result = await listByPlace(+placeId);
        res.status(200).json({
            message: "Quantidade de favoritos do ponto turístico obtida com sucesso",
            count: result.length
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao obter quantidade de favoritos do ponto turístico" });
    }
}