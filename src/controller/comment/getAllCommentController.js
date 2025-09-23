import { getAll } from "../../model/commentModel.js";

export const getAllCommentController = async (req, res) => {
    try {
        // Pode filtrar por restaurantId ou touristSpotId
        const filter = {};
        if (req.query.restaurantId) filter.restaurantId = +req.query.restaurantId;
        if (req.query.touristSpotId) filter.touristSpotId = +req.query.touristSpotId;
        const result = await getAll(filter);
        res.json({ message: "Comentários encontrados com sucesso", comments: result });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar comentários" });
    }
};