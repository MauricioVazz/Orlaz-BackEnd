import { remove, getById } from "../../model/profileModel.js";

export const deleteProfileController = async (req, res) => {
    try {
        const { id } = req.params;

        // ownership / authorization: only the owner or an ADMIN can delete
        const requester = req.user || req.userLogged;
        if (!requester) {
            return res.status(401).json({ message: 'Não autorizado' });
        }
        const requesterId = Number(requester.id);
        const targetId = Number(id);
        const requesterRole = requester.role ? String(requester.role).toUpperCase() : 'USER';
        if (requesterRole !== 'ADMIN' && requesterId !== targetId) {
            return res.status(403).json({ message: 'Acesso negado: só o proprietário ou admin pode deletar este perfil' });
        }

        const nid = +id;
        if (!id || isNaN(nid) || !Number.isInteger(nid) || nid <= 0) {
            return res.status(400).json({ error: 'ID inválido' });
        }

        const existing = await getById(nid);
        if (!existing) return res.status(404).json({ error: 'Perfil não encontrado' });

        const result = await remove(nid);
        return res.json({ message: 'Perfil deletado com sucesso', result });
    } catch (error) {
        console.error('deleteProfileController error:', error);
        // Map common Prisma errors if needed
        if (error && error.code === 'P2025') {
            return res.status(404).json({ error: 'Perfil não encontrado' });
        }
        if (error && error.code === 'P2003') {
            return res.status(409).json({ error: 'Não foi possível deletar devido a restrição de chave estrangeira' });
        }
        return res.status(500).json({ error: 'Erro ao deletar perfil', details: error.message });
    }
}