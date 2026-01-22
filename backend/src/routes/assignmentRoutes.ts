import express from 'express';
import { authenticate, authorize } from '../middleware/auth';
import { UserRole } from '../models/User';
import {
  createAssignment,
  getCourseAssignments,
  submitAssignment,
  gradeAssignment,
  getAssignmentSubmissions
} from '../controllers/assignmentController';

const router = express.Router();

router.post('/', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), createAssignment);
router.get('/course/:courseId', authenticate, getCourseAssignments);
router.post('/:assignmentId/submit', authenticate, submitAssignment);
router.put('/submissions/:submissionId/grade', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), gradeAssignment);
router.get('/:assignmentId/submissions', authenticate, authorize(UserRole.INSTRUCTOR, UserRole.ADMIN), getAssignmentSubmissions);

export default router;

