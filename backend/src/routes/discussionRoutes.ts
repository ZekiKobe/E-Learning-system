import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  createDiscussion,
  getCourseDiscussions,
  getDiscussion,
  upvoteDiscussion,
  resolveDiscussion,
  pinDiscussion
} from '../controllers/discussionController';

const router = express.Router();

router.post('/', authenticate, createDiscussion);
router.get('/course/:courseId', authenticate, getCourseDiscussions);
router.get('/:id', authenticate, getDiscussion);
router.post('/:id/upvote', authenticate, upvoteDiscussion);
router.put('/:id/resolve', authenticate, resolveDiscussion);
router.put('/:id/pin', authenticate, pinDiscussion);

export default router;

