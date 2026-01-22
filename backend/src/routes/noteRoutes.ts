import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createNote,
  getLessonNotes,
  getUserNotes,
  updateNote,
  deleteNote
} from '../controllers/noteController';

const router = express.Router();

router.post('/', authenticate, createNote);
router.get('/lesson/:lessonId', authenticate, getLessonNotes);
router.get('/', authenticate, getUserNotes);
router.put('/:id', authenticate, updateNote);
router.delete('/:id', authenticate, deleteNote);

export default router;

