import { Router, Response } from 'express';
import multer from 'multer';
import path from 'path';
import { authenticate, AuthRequest } from '../middleware/auth';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import User from '../models/User';

const router = Router();

const avatarStorage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, path.join(__dirname, '../../uploads/avatars'));
  },
  filename: (_req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, `${unique}${ext}`);
  }
});

const uploadAvatar = multer({ storage: avatarStorage });

// Get current user's enrollments
router.get('/me/enrollments', authenticate, async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const enrollments = await Enrollment.findAll({
      where: { userId: req.user.id },
      include: [
        {
          model: Course,
          as: 'course',
          include: [
            { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'avatar'] }
          ]
        }
      ],
      order: [['enrolledAt', 'DESC']]
    });

    res.json(enrollments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

// Update current user's profile
router.put('/me', authenticate, uploadAvatar.single('avatar'), async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const user = await User.findByPk(req.user.id);
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const body: any = req.body;

    if (req.file) {
      body.avatar = `/uploads/avatars/${req.file.filename}`;
    }

    if (typeof body.socialLinks === 'string') {
      try {
        body.socialLinks = JSON.parse(body.socialLinks);
      } catch {
        // ignore invalid JSON, leave unchanged
        delete body.socialLinks;
      }
    }

    // Only allow specific fields to be updated
    const allowedFields = ['firstName', 'lastName', 'bio', 'phone', 'address', 'socialLinks', 'avatar'];
    for (const key of Object.keys(body)) {
      if (allowedFields.includes(key)) {
        // @ts-ignore
        (user as any)[key] = body[key];
      }
    }

    await user.save();

    res.json({
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
      bio: user.bio,
      phone: user.phone,
      address: user.address,
      socialLinks: user.socialLinks
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;

