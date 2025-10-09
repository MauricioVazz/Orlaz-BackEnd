import express from 'express';
import { createProfileController } from '../controller/profile/createProfileController.js';
import { getByIdProfileController } from '../controller/profile/getByIdProfileController.js';
import { editProfileController } from '../controller/profile/editProfileController.js';
import { updateUserAvatarController } from '../controller/profile/updateUserAvatarController.js';
import { getAllProfileController } from '../controller/profile/getAllProfileController.js';
import { deleteProfileController } from '../controller/profile/deleteProfileController.js';


const router = express.Router();

router.post('/', createProfileController)
router.get('/:id', getByIdProfileController);
router.get('/', getAllProfileController);
router.patch('/:id', editProfileController);
router.patch('/:id/avatar', updateUserAvatarController);
router.delete('/:id', deleteProfileController);

export default router;