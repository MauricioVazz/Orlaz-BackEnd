import { getById } from "../../model/profileModel.js";

export const getByIdProfileController = async (req, res) => {
    try {
        const { id } = req.params;
        // Convert id using unary plus and validate as positive integer
        const nid = +id;
        if (!id || isNaN(nid) || !Number.isInteger(nid) || nid <= 0) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const result = await getById(nid);

        if (!result) {
            return res.status(404).json({ message: 'Perfil não encontrado' });
        }

        return res.json({
            message: "Perfil encontrado com sucesso",
            profile: result
        });
    } catch (error) {
        console.error('getByIdProfileController error:', error);
        return res.status(500).json({ error: "Erro ao buscar perfil" });
    }
}