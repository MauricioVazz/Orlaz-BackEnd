import { getById } from "../../model/commentModel.js";

export const getByIdCommentController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getById(+id);
        res.json({ message: "Comentário encontrado com sucesso", comment: result });
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar comentário" });
    }
};