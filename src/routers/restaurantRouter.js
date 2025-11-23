import express from 'express';
import multer from 'multer';
import { createRestaurantController } from '../controller/restaurant/createRestaurantController.js';
import { createRestaurantWithImagesController } from '../controller/restaurant/createRestaurantWithImagesController.js';
import { getByIdRestaurantController } from '../controller/restaurant/getByIdRestaurantController.js';
import { editRestaurantController } from '../controller/restaurant/editRestaurantController.js';
import { getAllRestaurantController } from '../controller/restaurant/getAllRestaurantController.js';
import { deleteRestaurantController } from '../controller/restaurant/deleteRestaurantController.js';
import { authenticator } from '../middleware/authenticator.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();
const storage = multer.memoryStorage();
const upload = multer({ storage });

router.post('/', authenticator, isAdmin, createRestaurantController);
// createRestaurantWithImagesController já aplica multer (upload.array) internamente,
// portanto não precisamos executar multer aqui para evitar duplicação.
router.post('/with-images', authenticator, isAdmin, createRestaurantWithImagesController);
router.get('/:id', getByIdRestaurantController);
router.get('/', getAllRestaurantController);
// aceitar múltiplos arquivos no campo 'images' para edição
router.patch('/:id', authenticator, isAdmin, upload.array('images'), editRestaurantController);
router.delete('/:id', authenticator, isAdmin, deleteRestaurantController);

export default router;
