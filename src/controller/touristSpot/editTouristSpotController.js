import { update } from "../../model/touristSpotModel.js";

export const editTouristSpotController = async (req, res) => {
    try {
        const { id } = req.params;
        let data = { ...req.body };

        const updated = await update(+id, data);
        res.json({
            mensagem: "Ponto turístico atualizado com sucesso",
            touristSpot: updated
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao atualizar ponto turístico" });
    }
};