import express from 'express';
import { createRestaurantController } from '../controller/restaurant/createRestaurantController.js';
import { createRestaurantWithImagesController } from '../controller/restaurant/createRestaurantWithImagesController.js';
import { getByIdRestaurantController } from '../controller/restaurant/getByIdRestaurantController.js';
import { editRestaurantController } from '../controller/restaurant/editRestaurantController.js';
import { getAllRestaurantController } from '../controller/restaurant/getAllRestaurantController.js';
import { deleteRestaurantController } from '../controller/restaurant/deleteRestaurantController.js';

const router = express.Router();

router.post('/', createRestaurantController);
router.post('/with-images', createRestaurantWithImagesController);
router.get('/:id', getByIdRestaurantController);
router.get('/', getAllRestaurantController);
router.patch('/:id', editRestaurantController);
router.delete('/:id', deleteRestaurantController);

export default router;
