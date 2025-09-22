import { update } from "../../model/restaurantModel.js";

export const editRestaurantController = async (req, res) => {
    try {
        const { id } = req.params;
        const restaurant = req.body;
        const result = await update(+id, restaurant);
        res.json({
            message: "Restaurante atualizado com sucesso",
            restaurant: result
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar restaurante" });
    }
};