import { Router } from 'express';
import {
  createReview,
  getCourseReviews,
  deleteReview,
  getAllReviewsAdmin
} from '../controllers/reviewController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

router.get('/course/:courseId', getCourseReviews);
router.post('/course/:courseId', authenticate, createReview);
router.delete('/:id', authenticate, deleteReview);

// Admin reviews listing
router.get('/admin', authenticate, authorize(UserRole.ADMIN), getAllReviewsAdmin);

export default router;

