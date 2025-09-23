import express from 'express';
import { createCommentController } from '../controller/comment/createCommentController.js';
import { getAllCommentController } from '../controller/comment/getAllCommentController.js';
import { getByIdCommentController } from '../controller/comment/getByIdCommentController.js';
import { editCommentController } from '../controller/comment/editCommentController.js';
import { deleteCommentController } from '../controller/comment/deleteCommentController.js';

const router = express.Router();

router.post('/', createCommentController);
router.get('/:id', getByIdCommentController);
router.get('/', getAllCommentController);
router.patch('/:id', editCommentController);
router.delete('/:id', deleteCommentController);

export default router;
