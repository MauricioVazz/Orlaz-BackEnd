import { getAll } from "../../model/profileModel.js";

export const getAllProfileController = async (req, res) => {
    try {
        const result = await getAll();
        res.json({
            message: "Perfis encontrados com sucesso",
            profiles: result
        })
    } catch (error) {
        res.status(500).json({ error: "Erro ao buscar perfis" });
    }
}