import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createBookmark,
  getLessonBookmarks,
  getUserBookmarks,
  deleteBookmark
} from '../controllers/bookmarkController';

const router = express.Router();

router.post('/', authenticate, createBookmark);
router.get('/lesson/:lessonId', authenticate, getLessonBookmarks);
router.get('/', authenticate, getUserBookmarks);
router.delete('/:id', authenticate, deleteBookmark);

export default router;

