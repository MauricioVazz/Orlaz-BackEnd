import express from 'express';
import { createProfileController } from '../controller/profile/createProfileController.js';
import { getByIdProfileController } from '../controller/profile/getByIdProfileController.js';
import { editProfileController } from '../controller/profile/editProfileController.js';
import { updateUserAvatarController } from '../controller/profile/updateUserAvatarController.js';
import { getAllProfileController } from '../controller/profile/getAllProfileController.js';
import { deleteProfileController } from '../controller/profile/deleteProfileController.js';
import { authenticator } from '../middleware/authenticator.js';
import { isAdmin } from '../middleware/isAdmin.js';


const router = express.Router();

// criação de profile (signup) permanece pública
router.post('/', createProfileController)
// consulta por id pública
router.get('/:id', getByIdProfileController);
// listagem de profiles: protegido e reservado a admins
router.get('/', authenticator, isAdmin, getAllProfileController);
// edição de profile: usuário autenticado (deve checar ownership no controller)
router.patch('/:id', authenticator, editProfileController);
// atualizar avatar do usuário autenticado
router.patch('/:id/avatar', authenticator, updateUserAvatarController);
// exclusão: permitido ao próprio usuário ou admin (controller valida ownership)
router.delete('/:id', authenticator, deleteProfileController);

export default router;