import { update, validateProfile } from "../../model/profileModel.js";
import bcrypt from 'bcrypt';

export const editProfileController = async (req, res) => {
    try {
        const { id } = req.params;
        const profile = req.body;

        // ownership / authorization: only the owner or an ADMIN can edit
        const requester = req.user || req.userLogged;
        if (!requester) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        const requesterId = Number(requester.id);
        const targetId = Number(id);
        const requesterRole = requester.role ? String(requester.role).toUpperCase() : 'USER';
        if (requesterRole !== 'ADMIN' && requesterId !== targetId) {
            return res.status(403).json({ message: 'Acesso negado: só o proprietário pode editar este perfil' });
        }

        // accept 'pass' as alias for 'password' if provided
        if (profile.pass && !profile.password) {
            profile.password = profile.pass;
            delete profile.pass;
        }

        // Partial validation: only provided fields are validated
        const validation = validateProfile(profile, true);
        if (!validation.success) {
            return res.status(400).json({ message: 'Dados inválidos', errors: validation.errors });
        }

        // Hash password only if present in validated data
        if (validation.data.password) {
            validation.data.password = await bcrypt.hash(validation.data.password, 10);
        }

        // Set updatedAt
        validation.data.updatedAt = new Date();

        const result = await update(+id, validation.data);
        return res.json({ message: 'Perfil atualizado com sucesso', profile: result });
    } catch (error) {
        console.error('editProfileController error:', error);
        if (error && error.message === 'Validation failed' && error.details) {
            return res.status(400).json({ errors: error.details });
        }
        if (error && error.code === 'P2002') {
            return res.status(409).json({ error: 'Email já cadastrado' });
        }
        return res.status(500).json({ error: 'Erro ao atualizar perfil' });
    }
}