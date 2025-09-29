import { remove } from "../../model/favoriteModel.js";

export const deleteFavoriteController = async (req, res) => {
    try {
        const { id, userId } = req.params;
        const result = await remove(+id, +userId);
        res.status(200).json({
            message: "Favorito deletado com sucesso",
            result: result
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao deletar favorito" });
    }
}