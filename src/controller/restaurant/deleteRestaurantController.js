import { remove } from "../../model/restaurantModel.js";

export const deleteRestaurantController = async (req, res) => {
    try {
        const id = +req.params.id;
        if (!id || Number.isNaN(id)) {
            return res.status(400).json({ error: 'ID inválido.' });
        }

        const result = await remove(id);
        return res.json({
            message: "Restaurante deletado com sucesso",
            result: result
        });
    } catch (error) {
        // Prisma P2025 when record to delete does not exist
        if (error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Restaurante não encontrado.' });
        }

        console.error('Erro em deleteRestaurantController:', error);
        const isProd = process.env.NODE_ENV === 'production';
        return res.status(500).json({ error: isProd ? 'Erro ao deletar restaurante' : (error.message || String(error)), stack: isProd ? undefined : error.stack });
    }
};