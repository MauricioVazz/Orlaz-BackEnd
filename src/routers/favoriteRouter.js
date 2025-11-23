import express from 'express';
import { createFavoriteController } from '../controller/favorite/createFavoriteController.js';
import { getByUserIdFavoriteController } from '../controller/favorite/getByUserIdFavoriteController.js';
import { getByTouristSpotIdFavoriteController } from '../controller/favorite/getByTouristSpotIdFavoriteController.js';
import { deleteFavoriteController } from '../controller/favorite/deleteFavoriteController.js';
import { authenticator } from '../middleware/authenticator.js';

const router = express.Router();

// Only authenticated user (owner) may create/list/delete their favorites.
router.post('/', authenticator, createFavoriteController);
router.get('/:userId', authenticator, getByUserIdFavoriteController);
router.get('/place/:placeId', getByTouristSpotIdFavoriteController);
router.delete('/:id/:userId', authenticator, deleteFavoriteController);

export default router;