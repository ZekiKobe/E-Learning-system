import { Router } from 'express';
import passport from '../config/passport';
import { register, login, getMe, googleCallback } from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

router.post('/register', register);
router.post('/login', login);
router.get('/me', authenticate, getMe);

// Google OAuth routes
router.get(
  '/google',
  passport.authenticate('google', {
    scope: ['profile', 'email'],
    session: false,
  })
);

router.get(
  '/google/callback',
  passport.authenticate('google', {
    session: false,
    failureRedirect: `${process.env.CLIENT_FRONTEND_URL || 'http://localhost:5174'}/login?error=google`,
  }),
  googleCallback
);

export default router;
