import express from 'express';
import { createGastronomyController } from '../controller/gastronomy/createGastronomyController.js';
import { createGastronomyWithImagesController } from '../controller/gastronomy/createGastronomyWithImagesController.js';
import { getByIdGastronomyController } from '../controller/gastronomy/getByIdGastronomyController.js';
import { editGastronomyController } from '../controller/gastronomy/editGastronomyController.js';
import { getAllGastronomyController } from '../controller/gastronomy/getAllGastronomyController.js';
import { getByCategoryGastronomyController } from '../controller/gastronomy/getByCategoryGastronomyController.js';
import { deleteGastronomyController } from '../controller/gastronomy/deleteGastronomyController.js';
import { authenticator } from '../middleware/authenticator.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

router.post('/', authenticator, isAdmin, createGastronomyController);
router.post('/with-images', authenticator, isAdmin, createGastronomyWithImagesController);
router.get('/category/:city', getByCategoryGastronomyController);
router.get('/:id', getByIdGastronomyController);
router.get('/', getAllGastronomyController);
router.patch('/:id', authenticator, isAdmin, editGastronomyController);
router.delete('/:id', authenticator, isAdmin, deleteGastronomyController);

export default router; 
