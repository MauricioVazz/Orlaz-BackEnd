import { remove } from "../../model/profileModel.js";

export const deleteProfileController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await remove(+id);
        if (!result) return res.status(404).json({ error: 'Perfil não encontrado' });
        res.json({
            message: "Perfil deletado com sucesso",
            result: result
        })
    } catch (error) {
        // If deletion fails due to foreign key constraints or other issues, return 409 with details
        console.error('deleteProfileController error:', error);
        res.status(500).json({ error: "Erro ao deletar perfil", details: error.message });
    }
}