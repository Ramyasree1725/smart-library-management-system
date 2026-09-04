import express from 'express';
import { 
  issueBook, 
  returnBook, 
  renewBook, 
  reserveBook, 
  cancelReservation, 
  payFine, 
  getAllTransactions, 
  getStudentTransactions, 
  getStudentReservations 
} from '../controllers/circulationController.js';
import { verifyToken, requireAdmin } from '../middleware/authMiddleware.js';

const router = express.Router();

// Student routes
router.get('/my-transactions', verifyToken, getStudentTransactions);
router.get('/my-reservations', verifyToken, getStudentReservations);
router.post('/reserve', verifyToken, reserveBook);
router.delete('/reserve/:id', verifyToken, cancelReservation);
router.post('/renew', verifyToken, renewBook);

// Admin circulation routes
router.get('/transactions', verifyToken, requireAdmin, getAllTransactions);
router.post('/issue', verifyToken, requireAdmin, issueBook);
router.post('/return', verifyToken, requireAdmin, returnBook);
router.post('/pay-fine', verifyToken, requireAdmin, payFine);

export default router;
