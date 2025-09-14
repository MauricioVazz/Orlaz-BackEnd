import { remove } from "../../model/touristSpotModel.js";

export const deleteTouristSpotController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await remove(+id);
        res.status(200).json({
            mensagem: "Ponto turístico deletado com sucesso",
            result: result
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar ponto turístico" });
    }
};
