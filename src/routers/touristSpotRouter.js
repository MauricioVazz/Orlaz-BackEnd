import express from 'express';

import { createTouristSpotController } from '../controller/touristSpot/createTouristSpotController.js';
import { getByIdTouristSpotByIdController } from '../controller/touristSpot/getByIdTouristSpotByIdController.js';
import { getAllTouristSpotsController } from '../controller/touristSpot/getAllTouristSpotsController.js';
import { searchTouristSpotController } from '../controller/touristSpot/searchTouristSpotController.js';
import { editTouristSpotController } from '../controller/touristSpot/editTouristSpotController.js';
import { deleteTouristSpotController } from '../controller/touristSpot/deleteTouristSpotController.js';
import { createTouristSpotWithImagesController } from '../controller/touristSpot/createTouristSpotWithImagesController.js';
import { authenticator } from '../middleware/authenticator.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// criação exige autenticação e permissão de ADMIN
router.post('/', authenticator, isAdmin, createTouristSpotController);
// createTouristSpotWithImagesController já aplica multer internamente
router.post('/with-images', authenticator, isAdmin, createTouristSpotWithImagesController);
router.get('/search', searchTouristSpotController);
router.get('/:id', getByIdTouristSpotByIdController);
router.get('/', getAllTouristSpotsController);
// edição e deleção protegidas (apenas ADMIN)
router.patch('/:id', authenticator, isAdmin, editTouristSpotController);
router.delete('/:id', authenticator, isAdmin, deleteTouristSpotController);

export default router;