import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Wishlist from '../models/Wishlist';
import Course from '../models/Course';
import User from '../models/User';
import Category from '../models/Category';

// Add to wishlist
export const addToWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const course = await Course.findByPk(Number(courseId));
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const [wishlistItem, created] = await Wishlist.findOrCreate({
      where: { userId, courseId: Number(courseId) },
      defaults: { userId, courseId: Number(courseId) }
    });

    if (!created) {
      return res.status(400).json({ error: 'Course already in wishlist' });
    }

    res.status(201).json(wishlistItem);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Remove from wishlist
export const removeFromWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const deleted = await Wishlist.destroy({
      where: { userId, courseId }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Course not in wishlist' });
    }

    res.json({ message: 'Removed from wishlist' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's wishlist
export const getWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const wishlist = await Wishlist.findAll({
      where: { userId },
      include: [
        {
          model: Course,
          as: 'course',
          include: [
            { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
            { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(wishlist);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Check if course is in wishlist
export const checkWishlist = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ inWishlist: false });
    }

    const wishlistItem = await Wishlist.findOne({
      where: { userId, courseId }
    });

    res.json({ inWishlist: !!wishlistItem });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

