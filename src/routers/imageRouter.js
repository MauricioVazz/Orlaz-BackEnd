import express from 'express';
import { uploadImageController } from '../controller/image/uploadImageController.js';

const router = express.Router();

router.post('/upload', uploadImageController);

export default router;