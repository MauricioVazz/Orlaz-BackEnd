import { update } from "../../model/profileModel.js";

export const editProfileController = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = req.body;

        const result = await update(+id, profile);
        res.json({
            message: "Perfil atualizado com sucesso",
            profile: result
        })
    } catch (error) {
        res.status(500).json({ error: "Erro ao atualizar perfil" });
    }
}