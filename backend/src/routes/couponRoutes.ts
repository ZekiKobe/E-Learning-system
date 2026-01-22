import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createCoupon,
  validateCoupon,
  getAllCoupons,
  updateCoupon
} from '../controllers/couponController';

const router = express.Router();

router.post('/', authenticate, authorize(UserRole.ADMIN), createCoupon);
router.post('/validate', validateCoupon);
router.get('/', authenticate, authorize(UserRole.ADMIN), getAllCoupons);
router.put('/:id', authenticate, authorize(UserRole.ADMIN), updateCoupon);

export default router;

