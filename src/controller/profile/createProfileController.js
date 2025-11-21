import { create } from "../../model/profileModel.js";
import { getRandomAvatarColor } from "../../utils/avatar.js";
import bcrypt from 'bcrypt';

export const createProfileController = async (req, res) => {
    try {
        const profile = req.body;

        if (!profile.password) {
            return res.status(400).json({ error: 'Senha é obrigatória' });
        }

        // Hash da senha antes de persistir
        const hashed = await bcrypt.hash(profile.password, 10);
        profile.password = hashed;

        profile.avatarColor = getRandomAvatarColor(); // Gera cor aleatória
        // profile.avatarUrl pode ficar vazio ou com valor padrão

        const data = await create(profile);
        res.status(201).json({
            mensagem: "Perfil criado com sucesso",
            profile: {
                id: data.id,
                name: data.name,
                email: data.email,
                avatarUrl: data.avatarUrl || null,
                avatarColor: data.avatarColor || null
            }
        });
    } catch (error) {
        console.error('createProfileController error:', error);
        // Tratamento de erros comuns do Prisma para respostas mais úteis
        if (error && error.code === 'P2002') {
            // Unique constraint failed (ex.: email já cadastrado)
            return res.status(409).json({ error: 'Email já cadastrado' });
        }
        if (error && error.code === 'P2022') {
            // Coluna ausente / mismatched schema
            return res.status(500).json({ error: 'Erro de esquema no banco: coluna ausente. Rode as migrations ou adicione a coluna necessária.' });
        }

        res.status(500).json({ error: "Erro ao criar perfil" });
    }
};