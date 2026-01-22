import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import {
  updateLessonProgress,
  getLessonProgress,
  getCourseProgress,
  getEnrollmentAnalytics
} from '../controllers/progressController';
import { UserRole } from '../models/User';

const router = express.Router();

router.put('/lessons/:lessonId', authenticate, updateLessonProgress);
router.get('/lessons/:lessonId', authenticate, getLessonProgress);
router.get('/courses/:courseId', authenticate, getCourseProgress);

// Admin analytics
router.get('/admin/enrollment-analytics', authenticate, authorize(UserRole.ADMIN), getEnrollmentAnalytics);

export default router;

