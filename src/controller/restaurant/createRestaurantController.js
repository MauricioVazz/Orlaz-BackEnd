import { create } from "../../model/restaurantModel.js";

export const createRestaurantController = async (req, res) => {
    try {
        const restaurant = req.body;
        const data = await create(restaurant);
        res.status(201).json({
            mensagem: "Restaurante criado com sucesso",
            restaurant: data
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar restaurante" });
    }
};