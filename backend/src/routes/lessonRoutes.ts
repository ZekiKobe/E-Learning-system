import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import {
  getCourseLessons,
  createLesson,
  updateLesson,
  deleteLesson
} from '../controllers/lessonController';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';

const router = Router();

// Configure multer for video uploads
const videoStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/videos'));
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});
const uploadVideo = multer({
  storage: videoStorage,
  limits: { fileSize: (Number(process.env.MAX_VIDEO_MB) || 1024) * 1024 * 1024 } // default 1024MB
});

router.get('/course/:courseId', getCourseLessons);
router.post('/course/:courseId', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), uploadVideo.single('video'), createLesson);
router.put('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), updateLesson);
router.delete('/:id', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), deleteLesson);

export default router;

