import { getById } from "../../model/restaurantModel.js";

export const getByIdRestaurantController = async (req, res) => {
    try {
        const id = +req.params.id;
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const result = await getById(id);
        if (!result) {
            return res.status(404).json({ error: 'Restaurante não encontrado.' });
        }

        return res.json({
            message: "Restaurante encontrado com sucesso",
            restaurant: result
        });
    } catch (error) {
        console.error('Erro em getByIdRestaurantController:', error);
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(500).json({ error: isProd ? 'Erro ao buscar restaurante' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
    }
};