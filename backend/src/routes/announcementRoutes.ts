import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createAnnouncement,
  getCourseAnnouncements,
  updateAnnouncement,
  deleteAnnouncement
} from '../controllers/announcementController';

const router = express.Router();

router.post('/', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), createAnnouncement);
router.get('/course/:courseId', authenticate, getCourseAnnouncements);
router.put('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), updateAnnouncement);
router.delete('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), deleteAnnouncement);

export default router;

