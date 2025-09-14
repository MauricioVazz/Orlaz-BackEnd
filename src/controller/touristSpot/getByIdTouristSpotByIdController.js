import { getById } from "../../model/touristSpotModel.js";

export const getByIdTouristSpotByIdController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getById(+id);
        if (!result) {
            return res.status(404).json({
                mensagem: "Ponto turístico não encontrado",
                touristSpot: result
            });
        }
        res.json({ mensagem: "Ponto turístico encontrado com sucesso", touristSpot: result });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar ponto turístico" });
    }
};
