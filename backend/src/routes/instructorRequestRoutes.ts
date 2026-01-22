import { Router } from 'express';
import {
  createRequest,
  getMyRequest,
  getAllRequests,
  approveRequest,
  rejectRequest
} from '../controllers/instructorRequestController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.post('/', authenticate, createRequest);
router.get('/me', authenticate, getMyRequest);
router.get('/all', authenticate, authorize(UserRole.ADMIN), getAllRequests);
router.post('/:id/approve', authenticate, authorize(UserRole.ADMIN), approveRequest);
router.post('/:id/reject', authenticate, authorize(UserRole.ADMIN), rejectRequest);

export default router;

