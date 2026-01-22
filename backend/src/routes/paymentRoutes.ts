import { Router } from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createCheckout,
  chapaVerify,
  telebirrNotify,
  getAllPayments
} from '../controllers/paymentController';

const router = Router();

router.post('/checkout', authenticate, createCheckout);
router.get('/chapa/verify/:reference', chapaVerify);
router.post('/telebirr/notify', telebirrNotify);

// Admin payments listing
router.get('/admin', authenticate, authorize(UserRole.ADMIN), getAllPayments);

export default router;


