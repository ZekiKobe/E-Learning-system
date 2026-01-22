import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createQuiz,
  getQuiz,
  addQuestion,
  startQuizAttempt,
  submitQuizAttempt,
  getUserQuizAttempts
} from '../controllers/quizController';

const router = express.Router();

router.post('/', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), createQuiz);
router.get('/:id', authenticate, getQuiz);
router.post('/:quizId/questions', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), addQuestion);
router.post('/:quizId/attempts', authenticate, startQuizAttempt);
router.put('/attempts/:attemptId', authenticate, submitQuizAttempt);
router.get('/:quizId/attempts', authenticate, getUserQuizAttempts);

export default router;

