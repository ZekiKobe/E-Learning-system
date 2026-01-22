import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getAllCourses,
  getCourseById,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  getMyCourses
} from '../controllers/courseController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Configure multer for image uploads (thumbnails)
const imageStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/images'));
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});
const uploadImage = multer({
  storage: imageStorage,
  limits: { fileSize: (Number(process.env.MAX_IMAGE_MB) || 20) * 1024 * 1024 } // default 20MB
});

router.get('/', getAllCourses);
router.get('/mine', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), getMyCourses);
router.get('/:id', getCourseById);
router.post('/', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), uploadImage.single('thumbnail'), createCourse);
router.put('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), uploadImage.single('thumbnail'), updateCourse);
router.delete('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), deleteCourse);
router.post('/:id/enroll', authenticate, enrollInCourse);

export default router;

