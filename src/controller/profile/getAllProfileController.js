import { getAll } from "../../model/profileModel.js";

export const getAllProfileController = async (req, res) => {
    try {
        const result = await getAll();
        res.json({
            message: "Perfis encontrados com sucesso",
            profiles: result
        })
    } catch (error) {
        console.error('getAllProfileController error:', error);
        const payload = { error: 'Erro ao buscar perfis' };
        if (process.env.NODE_ENV !== 'production') payload.stack = error.stack;
        res.status(500).json(payload);
    }
}