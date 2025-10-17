import express from 'express';
import { createGastronomyController } from '../controller/gastronomy/createGastronomyController.js';
import { createGastronomyWithImagesController } from '../controller/gastronomy/createGastronomyWithImagesController.js';
import { getByIdGastronomyController } from '../controller/gastronomy/getByIdGastronomyController.js';
import { editGastronomyController } from '../controller/gastronomy/editGastronomyController.js';
import { getAllGastronomyController } from '../controller/gastronomy/getAllGastronomyController.js';
import { deleteGastronomyController } from '../controller/gastronomy/deleteGastronomyController.js';

const router = express.Router();

router.post('/', createGastronomyController);
router.post('/with-images', createGastronomyWithImagesController);
router.get('/:id', getByIdGastronomyController);
router.get('/', getAllGastronomyController);
router.patch('/:id', editGastronomyController);
router.delete('/:id', deleteGastronomyController);

export default router;
