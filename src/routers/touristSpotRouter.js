import express from 'express';

import { createTouristSpotController } from '../controller/touristSpot/createTouristSpotController.js';
import { getByIdTouristSpotByIdController } from '../controller/touristSpot/getByIdTouristSpotByIdController.js';
import { getAllTouristSpotsController } from '../controller/touristSpot/getAllTouristSpotsController.js';
import { editTouristSpotController } from '../controller/touristSpot/editTouristSpotController.js';
import { deleteTouristSpotController } from '../controller/touristSpot/deleteTouristSpotController.js';
import { createTouristSpotWithImagesController } from '../controller/touristSpot/createTouristSpotWithImagesController.js';

const router = express.Router();

router.post('/', createTouristSpotController);
router.post('/with-images', createTouristSpotWithImagesController);
router.get('/:id', getByIdTouristSpotByIdController);
router.get('/', getAllTouristSpotsController);
router.patch('/:id', editTouristSpotController);
router.delete('/:id', deleteTouristSpotController);

export default router;