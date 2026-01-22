import express from 'express';
import { authenticate } from '../middleware/auth';
import {
  addToWishlist,
  removeFromWishlist,
  getWishlist,
  checkWishlist
} from '../controllers/wishlistController';

const router = express.Router();

router.post('/:courseId', authenticate, addToWishlist);
router.delete('/:courseId', authenticate, removeFromWishlist);
router.get('/', authenticate, getWishlist);
router.get('/check/:courseId', authenticate, checkWishlist);

export default router;

