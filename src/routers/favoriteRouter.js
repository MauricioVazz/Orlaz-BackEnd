import express from 'express';
import { createFavoriteController } from '../controller/favorite/createFavoriteController.js';
import { getByUserIdFavoriteController } from '../controller/favorite/getByUserIdFavoriteController.js';
import { getByTouristSpotIdFavoriteController } from '../controller/favorite/getByTouristSpotIdFavoriteController.js';
import { deleteFavoriteController } from '../controller/favorite/deleteFavoriteController.js';

const router = express.Router();

router.post('/', createFavoriteController);
router.get('/:userId', getByUserIdFavoriteController);
router.get('/place/:placeId', getByTouristSpotIdFavoriteController)
router.delete('/:id/:userId', deleteFavoriteController)

export default router;