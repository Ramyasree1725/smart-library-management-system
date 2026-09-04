import express from 'express';
import { getDashboardStats } from '../controllers/analyticsController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/dashboard', verifyToken, requireAdmin, getDashboardStats);

export default router;
