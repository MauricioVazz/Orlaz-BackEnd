import { create } from "../../model/profileModel.js";
import { getRandomAvatarColor } from "../../utils/avatar.js";

export const createProfileController = async (req, res) => {
    try {
        const profile = req.body;
        profile.avatarColor = getRandomAvatarColor(); // Gera cor aleatória
        // profile.avatarUrl pode ficar vazio ou com valor padrão
        const data = await create(profile);
        res.status(201).json({
            mensagem: "Perfil criado com sucesso",
            profile: data
        });
    } catch (error) {
        res.status(500).json({ error: "Erro ao criar perfil" });
    }
};