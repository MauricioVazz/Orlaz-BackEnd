import { getAll } from "../../model/restaurantModel.js";

export const getAllRestaurantController = async (req, res) => {
    try {
        const result = await getAll();
        res.json({
            message: "Restaurantes encontrados com sucesso",
            restaurants: result
        });
    } catch (error) {
        console.error('Erro em getAllRestaurantController:', error);
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(500).json({ error: isProd ? 'Erro ao buscar restaurantes' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
    }
};