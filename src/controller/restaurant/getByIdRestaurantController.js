import { getById } from "../../model/restaurantModel.js";

export const getByIdRestaurantController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getById(+id);
        res.json({
            message: "Restaurante encontrado com sucesso",
            restaurant: result
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar restaurante" });
    }
};