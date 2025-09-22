import { getAll } from "../../model/restaurantModel.js";

export const getAllRestaurantController = async (req, res) => {
    try {
        const result = await getAll();
        res.json({
            message: "Restaurantes encontrados com sucesso",
            restaurants: result
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar restaurantes" });
    }
};