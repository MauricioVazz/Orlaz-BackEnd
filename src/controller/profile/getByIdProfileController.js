import { getById } from "../../model/profileModel.js";

export const getByIdProfileController = async (req, res) => {
    try {
        const { id } = req.params;
        const result = await getById(+id);

        res.json({
            message: "Perfil encontrado com sucesso",
            profile: result
        })
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar perfil" });
    }
}