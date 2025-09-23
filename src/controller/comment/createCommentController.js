import { create } from "../../model/commentModel.js";

export const createCommentController = async (req, res) => {
    try {
        const comment = req.body;
        // Adicione validação para garantir que o usuário logado está correto
        const data = await create(comment);
        res.status(201).json({ mensagem: "Comentário criado com sucesso", comment: data });
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar comentário" });
    }
};