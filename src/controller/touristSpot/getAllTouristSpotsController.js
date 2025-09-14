import { list } from "../../model/touristSpotModel.js";

export const getAllTouristSpotsController = async (req, res) => {
    try {
        const result = await list();
        res.json({
            mensagem: "Pontos turísticos listados com sucesso",
            touristSpots: result
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao listar pontos turísticos" });
    }
};
