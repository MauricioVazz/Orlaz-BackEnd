import express from 'express';
import { createCommentController } from '../controller/comment/createCommentController.js';
import { getAllCommentController } from '../controller/comment/getAllCommentController.js';
import { getByIdCommentController } from '../controller/comment/getByIdCommentController.js';
import { editCommentController } from '../controller/comment/editCommentController.js';
import { deleteCommentController } from '../controller/comment/deleteCommentController.js';
import { authenticator } from '../middleware/authenticator.js';
import { isAdmin } from '../middleware/isAdmin.js';

const router = express.Router();

// creating a comment requires authentication (owner must match)
router.post('/', authenticator, createCommentController);
router.get('/:id', getByIdCommentController);
router.get('/', getAllCommentController);
// edit/delete require authentication; controller enforces owner OR admin
router.patch('/:id', authenticator, editCommentController);
router.delete('/:id', authenticator, deleteCommentController);

export default router;
