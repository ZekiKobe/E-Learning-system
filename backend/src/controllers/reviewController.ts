import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import Review from '../models/Review';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import User from '../models/User';

export const createReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { courseId } = req.params;
    const { rating, comment } = req.body;

    // Check if user is enrolled
    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId: Number(courseId) }
    });

    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled in this course to leave a review' });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      where: { userId: req.user.id, courseId: Number(courseId) }
    });

    if (existingReview) {
      // Update existing review
      await existingReview.update({ rating, comment });
    } else {
      // Create new review
      await Review.create({
        userId: req.user.id,
        courseId: Number(courseId),
        rating,
        comment
      });
    }

    // Update course rating
    await updateCourseRating(Number(courseId));

    const review = await Review.findOne({
      where: { userId: req.user.id, courseId: Number(courseId) },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }]
    });

    res.status(201).json(review);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getCourseReviews = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10 } = req.query;

    const reviews = await Review.findAndCountAll({
      where: { courseId: Number(courseId) },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }],
      limit: Number(limit),
      offset: (Number(page) - 1) * Number(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json({
      reviews: reviews.rows,
      total: reviews.count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(reviews.count / Number(limit))
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const deleteReview = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { id } = req.params;
    const review = await Review.findByPk(id);

    if (!review) {
      return res.status(404).json({ error: 'Review not found' });
    }

    // Check if user owns the review or is admin
    if (review.userId !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const courseId = review.courseId;
    await review.destroy();

    // Update course rating
    await updateCourseRating(courseId);

    res.json({ message: 'Review deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Admin: get all reviews with user and course
export const getAllReviewsAdmin = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const { ratingMin, ratingMax, courseId } = req.query as any;

    const where: any = {};
    if (courseId) where.courseId = Number(courseId);
    if (ratingMin || ratingMax) {
      where.rating = {};
      if (ratingMin) where.rating[Op.gte] = Number(ratingMin);
      if (ratingMax) where.rating[Op.lte] = Number(ratingMax);
    }

    const reviews = await Review.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] },
        { model: Course, as: 'reviewedCourse', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(reviews);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update course rating
async function updateCourseRating(courseId: number) {
  const reviews = await Review.findAll({
    where: { courseId },
    attributes: ['rating']
  });

  if (reviews.length > 0) {
    const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
    await Course.update(
      { rating: Number(avgRating.toFixed(2)), totalRatings: reviews.length },
      { where: { id: courseId } }
    );
  }
}

