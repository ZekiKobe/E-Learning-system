import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import Course, { CourseStatus } from '../models/Course';
import Lesson from '../models/Lesson';
import Category from '../models/Category';
import User, { UserRole } from '../models/User';
import Enrollment from '../models/Enrollment';

export const getAllCourses = async (req: AuthRequest, res: Response) => {
  try {
    const { status, categoryId, search, page = 1, limit = 10 } = req.query;
    const offset = (Number(page) - 1) * Number(limit);

    const where: any = {};
    if (status) where.status = status;
    if (categoryId) where.categoryId = Number(categoryId);
    if (search) {
      where[Op.or] = [
        { title: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }

    const courses = await Course.findAndCountAll({
      where,
      include: [
        { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'avatar'], required: false },
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'], required: false }
      ],
      limit: Number(limit),
      offset,
      order: [['createdAt', 'DESC']]
    });

    res.json({
      courses: courses.rows,
      total: courses.count,
      page: Number(page),
      limit: Number(limit),
      totalPages: Math.ceil(courses.count / Number(limit))
    });
  } catch (error: any) {
    console.error('getAllCourses error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ error: error.message || 'Internal server error' });
  }
};

export const getCourseById = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    let course = null as any;

    try {
      course = await Course.findByPk(id, {
        include: [
          { model: User, as: 'instructor', attributes: ['id', 'firstName', 'lastName', 'avatar', 'bio'] },
          { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] }
        ]
      });
    } catch (includeErr: any) {
      console.error('getCourseById include error:', includeErr?.message || includeErr);
      // Fallback: fetch without includes to avoid hard 500s from association issues
      course = await Course.findByPk(id);
    }

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is enrolled
    let enrollment = null;
    if (req.user) {
      enrollment = await Enrollment.findOne({
        where: { userId: req.user.id, courseId: course.id }
      });
    }

    res.json({ course, enrollment });
  } catch (error: any) {
    console.error('getCourseById error:', error?.message || error);
    res.status(500).json({ error: error.message });
  }
};

export const getMyCourses = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Not authenticated' });

    const courses = await Course.findAll({
      where: { instructorId: req.user.id },
      include: [
        { model: Category, as: 'category', attributes: ['id', 'name', 'slug'] },
        { model: Lesson, as: 'lessons' }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(courses);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createCourse = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (![UserRole.INSTRUCTOR, UserRole.ADMIN].includes(req.user.role)) {
      return res.status(403).json({ error: 'Only instructors or admins can create courses' });
    }

    const {
      title,
      description,
      shortDescription,
      price,
      categoryId,
      level,
      language,
      status
    } = req.body;

    const slug = title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    const course = await Course.create({
      title,
      slug,
      description,
      shortDescription,
      price: parseFloat(price),
      instructorId: req.user.id,
      categoryId,
      level,
      language,
      status: status || CourseStatus.DRAFT,
      thumbnail: req.file ? `/uploads/images/${req.file.filename}` : undefined
    });

    const createdCourse = await Course.findByPk(course.id, {
      include: [
        { model: User, as: 'instructor' },
        { model: Category, as: 'category' }
      ]
    });

    res.status(201).json(createdCourse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is instructor or admin
    if (req.user && req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const updateData = { ...req.body } as any;
    if (updateData.title) {
      updateData.slug = updateData.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }

    // Handle thumbnail upload if provided
    if (req.file) {
      updateData.thumbnail = `/uploads/images/${req.file.filename}`;
    }

    await course.update(updateData);

    const updatedCourse = await Course.findByPk(id, {
      include: [
        { model: User, as: 'instructor' },
        { model: Category, as: 'category' }
      ]
    });

    res.json(updatedCourse);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteCourse = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is instructor or admin
    if (req.user && req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await course.destroy();
    res.json({ message: 'Course deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const enrollInCourse = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const { id } = req.params;
    const course = await Course.findByPk(id);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if already enrolled
    const existingEnrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId: course.id }
    });

    if (existingEnrollment) {
      return res.status(400).json({ error: 'Already enrolled in this course' });
    }

    const enrollment = await Enrollment.create({
      userId: req.user.id,
      courseId: course.id,
      progress: 0,
      completed: false
    });

    // Update course student count
    await course.increment('totalStudents');

    res.status(201).json(enrollment);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

