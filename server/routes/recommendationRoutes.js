import express from 'express';
import { getRecommendations } from '../controllers/recommendationController.js';
import { verifyToken } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', verifyToken, getRecommendations);

export default router;
