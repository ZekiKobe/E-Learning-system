import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  requestRefund,
  getUserRefunds,
  getAllRefunds,
  processRefund
} from '../controllers/refundController';

const router = express.Router();

router.post('/', authenticate, requestRefund);
router.get('/', authenticate, getUserRefunds);
router.get('/all', authenticate, authorize(UserRole.ADMIN), getAllRefunds);
router.put('/:id/process', authenticate, authorize(UserRole.ADMIN), processRefund);

export default router;

