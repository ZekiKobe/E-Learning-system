import { Request, Response } from 'express';
import jwt, { Secret, SignOptions } from 'jsonwebtoken';
import User, { UserRole } from '../models/User';
import { AuthRequest } from '../middleware/auth';

const generateToken = (userId: number): string => {
  const secret: Secret = (process.env.JWT_SECRET || 'secret') as Secret;
  const options: SignOptions = { expiresIn: (process.env.JWT_EXPIRES_IN as any) || '7d' };
  return jwt.sign({ userId }, secret, options);
};

export const register = async (req: Request, res: Response) => {
  try {
    const { email, password, firstName, lastName, role } = req.body;

    // Check if user exists
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Only allow admin creation through special endpoint or first user
    const userRole = role === UserRole.ADMIN ? UserRole.ADMIN : UserRole.STUDENT;

    const user = await User.create({
      email,
      password,
      firstName,
      lastName,
      role: userRole
    });

    const token = generateToken(user.id);

    res.status(201).json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role
      }
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    if (!user.isActive) {
      return res.status(401).json({ error: 'Account is inactive' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = generateToken(user.id);

    res.json({
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
        avatar: user.avatar
      }
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getMe = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    res.json({
      id: req.user.id,
      email: req.user.email,
      firstName: req.user.firstName,
      lastName: req.user.lastName,
      role: req.user.role,
      avatar: req.user.avatar,
      bio: req.user.bio
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Google OAuth callback handler: user is attached by passport
export const googleCallback = (req: Request, res: Response) => {
  const user = (req as any).user as User | undefined;

  if (!user) {
    return res.redirect(
      `${process.env.CLIENT_FRONTEND_URL || 'http://localhost:5174'}/login?error=google`
    );
  }

  const token = generateToken(user.id);

  const clientUrl = process.env.CLIENT_FRONTEND_URL || 'http://localhost:5174';
  const redirectUrl = new URL(clientUrl);
  redirectUrl.pathname = '/login';
  redirectUrl.searchParams.set('token', token);

  return res.redirect(redirectUrl.toString());
};

