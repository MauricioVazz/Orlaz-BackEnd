import { create, validateProfile } from "../../model/profileModel.js";
import { getRandomAvatarColor } from "../../utils/avatar.js";
import bcrypt from 'bcrypt';

export const createProfileController = async (req, res) => {
    try {
        const profile = req.body;

        // Validate raw input before hashing password
        const validation = validateProfile(profile, false);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.errors });
        }

        // Hash the validated plain password
        validation.data.password = await bcrypt.hash(validation.data.password, 10);

        // Ensure avatarColor exists
        validation.data.avatarColor = validation.data.avatarColor || getRandomAvatarColor();

        const data = await create(validation.data);
        return res.status(201).json({
            mensagem: 'Perfil criado com sucesso',
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
        if (error && error.message === 'Validation failed' && error.details) {
            return res.status(400).json({ errors: error.details });
        }
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