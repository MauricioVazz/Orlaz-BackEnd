import { list } from "../../model/touristSpotModel.js";

export const getAllTouristSpotsController = async (req, res) => {
    try {
        const result = await list();
        res.json({
            mensagem: "Pontos turísticos listados com sucesso",
            touristSpots: result
        });
    } catch (error) {
        console.error('getAllTouristSpotsController error:', error);
        const payload = { error: 'Erro ao listar pontos turísticos' };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        res.status(500).json(payload);
    }
};
