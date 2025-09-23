import { getById, remove } from "../../model/commentModel.js";

export const deleteCommentController = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await getById(+id);
        if (!comment) return res.status(404).json({ error: "Comentário não encontrado" });
        // Substitua req.user.id pelo id do usuário logado
        if (comment.userId !== req.body.userId) {
            return res.status(403).json({ error: "Você só pode deletar seu próprio comentário" });
        }
        const result = await remove(+id);
        res.json({ message: "Comentário deletado com sucesso", result });
    } catch (error) {
        res.status(500).json({ error: "Erro ao deletar comentário" });
    }
};