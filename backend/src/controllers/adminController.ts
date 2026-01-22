import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import User from '../models/User';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import Category from '../models/Category';
import Payment, { PaymentStatus } from '../models/Payment';

export const getDashboardStats = async (req: AuthRequest, res: Response) => {
  try {
    const totalUsers = await User.count();
    const totalCourses = await Course.count();
    const totalEnrollments = await Enrollment.count();
    const totalCategories = await Category.count();

    // Revenue analytics
    const successfulPayments = await Payment.findAll({
      where: { status: PaymentStatus.SUCCESS },
      include: [{ model: Course, as: 'paymentCourse', attributes: ['price'] }]
    });
    const totalRevenue = successfulPayments.reduce((sum, p) => sum + Number(p.amount || 0), 0);
    const platformRevenue = totalRevenue * 0.3; // 30% platform fee
    const instructorRevenue = totalRevenue * 0.7; // 70% instructor share

    // Top courses
    const topCourses = await Course.findAll({
      limit: 5,
      order: [['totalStudents', 'DESC']],
      include: [
        { model: User, as: 'instructor', attributes: ['firstName', 'lastName'] }
      ]
    });

    const recentCourses = await Course.findAll({
      limit: 5,
      order: [['createdAt', 'DESC']],
      include: [
        { model: User, as: 'instructor', attributes: ['firstName', 'lastName'] }
      ]
    });

    res.json({
      stats: {
        totalUsers,
        totalCourses,
        totalEnrollments,
        totalCategories,
        totalRevenue,
        platformRevenue,
        instructorRevenue
      },
      topCourses,
      recentCourses
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllUsers = async (req: AuthRequest, res: Response) => {
  try {
    const { role, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (role) where.role = role;

    const users = await User.findAndCountAll({
      where,
      attributes: { exclude: ['password'] },
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      users: users.rows,
      total: users.count,
      page: Number(page),
      limit: Number(limit)
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const { password, ...updateData } = req.body;
    await user.update(updateData);

    const updatedUser = await User.findByPk(id, {
      attributes: { exclude: ['password'] }
    });

    res.json(updatedUser);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const user = await User.findByPk(id);

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    await user.destroy();
    res.json({ message: 'User deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllCategories = async (req: AuthRequest, res: Response) => {
  try {
    const categories = await Category.findAll({
      order: [['name', 'ASC']]
    });
    res.json(categories);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { name, description, image } = req.body;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const category = await Category.create({
      name,
      slug,
      description,
      image
    });

    res.status(201).json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    const updateData = { ...req.body };
    if (updateData.name) {
      updateData.slug = updateData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    await category.update(updateData);
    res.json(category);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCategory = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const category = await Category.findByPk(id);

    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    await category.destroy();
    res.json({ message: 'Category deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

