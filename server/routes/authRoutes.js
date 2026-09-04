import express from 'express';
import { register, login, getMe, getAllUsers } from '../controllers/authController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', verifyToken, getMe);
router.get('/students', verifyToken, requireAdmin, getAllUsers);

export default router;
