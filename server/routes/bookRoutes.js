import express from 'express';
import { getBooks, getBookById, createBook, updateBook, deleteBook } from '../controllers/bookController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public / Authenticated catalog reading
router.get('/', getBooks);
router.get('/:id', getBookById);

// Admin-only management
router.post('/', verifyToken, requireAdmin, createBook);
router.put('/:id', verifyToken, requireAdmin, updateBook);
router.delete('/:id', verifyToken, requireAdmin, deleteBook);

export default router;
