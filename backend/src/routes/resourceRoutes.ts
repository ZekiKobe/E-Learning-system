import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createResource,
  getCourseResources,
  downloadResource,
  deleteResource
} from '../controllers/resourceController';

const router = express.Router();

router.post('/', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), createResource);
router.get('/course/:courseId', authenticate, getCourseResources);
router.post('/:id/download', authenticate, downloadResource);
router.delete('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), deleteResource);

export default router;

