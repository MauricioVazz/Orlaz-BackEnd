import { getById, update } from "../../model/commentModel.js";

export const editCommentController = async (req, res) => {
    try {
        const { id } = req.params;
        const comment = await getById(+id);
        if (!comment) return res.status(404).json({ error: "Comentário não encontrado" });
        // Substitua req.user.id pelo id do usuário logado
        if (comment.userId !== req.body.userId) {
            return res.status(403).json({ error: "Você só pode editar seu próprio comentário" });
        }
        const result = await update(+id, req.body);
        res.json({ message: "Comentário atualizado com sucesso", comment: result });
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar comentário" });
    }
};