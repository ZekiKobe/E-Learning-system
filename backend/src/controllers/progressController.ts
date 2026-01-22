import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import LessonProgress from '../models/LessonProgress';
import Enrollment from '../models/Enrollment';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import User from '../models/User';

// Update lesson progress
export const updateLessonProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const { watchTime, lastPosition, completed } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const lesson = await Lesson.findByPk(Number(lessonId), {
      include: [{ model: Course, as: 'course' }]
    });

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: { userId, courseId: lesson.courseId }
    });
    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled to track progress' });
    }

    let progress = await LessonProgress.findOne({
      where: { userId, lessonId }
    });

    if (progress) {
      progress.watchTime = watchTime || progress.watchTime;
      progress.lastPosition = lastPosition !== undefined ? lastPosition : progress.lastPosition;
      if (completed && !progress.completed) {
        progress.completed = true;
        progress.completedAt = new Date();
      }
      await progress.save();
    } else {
      progress = await LessonProgress.create({
        userId,
        lessonId: Number(lessonId),
        watchTime: watchTime || 0,
        lastPosition,
        completed: completed || false,
        completedAt: completed ? new Date() : undefined
      });
    }

    // Update course progress
    await updateCourseProgress(userId, lesson.courseId);

    res.json(progress);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get lesson progress
export const getLessonProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const progress = await LessonProgress.findOne({
      where: { userId, lessonId }
    });

    res.json(progress || { completed: false, watchTime: 0, lastPosition: 0 });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get course progress
export const getCourseProgress = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const enrollment = await Enrollment.findOne({
      where: { userId, courseId }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Not enrolled in this course' });
    }

    const course = await Course.findByPk(Number(courseId), {
      include: [{ model: Lesson, as: 'lessons' }]
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lessons = (course as any).lessons;
    const totalLessons = lessons.length;
    const lessonIds = lessons.map((l: any) => l.id);

    const completedLessons = await LessonProgress.count({
      where: {
        userId,
        lessonId: { [Op.in]: lessonIds },
        completed: true
      }
    });

    const progressPercentage = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

    const lessonProgress = await LessonProgress.findAll({
      where: { userId, lessonId: { [Op.in]: lessonIds } },
      include: [{ model: Lesson, as: 'lesson' }]
    });

    res.json({
      enrollment,
      totalLessons,
      completedLessons,
      progressPercentage: Math.round(progressPercentage),
      lessonProgress
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to update course progress
async function updateCourseProgress(userId: number, courseId: number) {
  const course = await Course.findByPk(courseId, {
    include: [{ model: Lesson, as: 'lessons' }]
  });

  if (!course) return;

  const lessons = (course as any).lessons || [];
  const totalLessons = lessons.length;
  if (totalLessons === 0) return;

  const lessonIds = lessons.map((l: any) => l.id);
  const completedLessons = await LessonProgress.count({
    where: {
      userId,
      lessonId: { [Op.in]: lessonIds },
      completed: true
    }
  });

  const progress = Math.round((completedLessons / totalLessons) * 100);
  const completed = progress === 100;

  const enrollment = await Enrollment.findOne({
    where: { userId, courseId }
  });

  if (enrollment) {
    enrollment.progress = progress;
    enrollment.completed = completed;
    if (completed && !enrollment.completedAt) {
      enrollment.completedAt = new Date();
    }
    await enrollment.save();
  }
}

// Admin: basic enrollment analytics per course
export const getEnrollmentAnalytics = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const courses = await Course.findAll({
      attributes: ['id', 'title', 'totalStudents', 'createdAt'],
      include: [
        {
          model: Enrollment,
          as: 'enrollments',
          attributes: ['id', 'completed', 'enrolledAt', 'completedAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    const data = courses.map((course: any) => {
      const enrollments: Enrollment[] = course.enrollments || [];
      const totalEnrollments = enrollments.length;
      const completedCount = enrollments.filter((e) => e.completed).length;
      const completionRate =
        totalEnrollments > 0 ? Math.round((completedCount / totalEnrollments) * 100) : 0;

      return {
        id: course.id,
        title: course.title,
        totalStudents: course.totalStudents || totalEnrollments,
        totalEnrollments,
        completedCount,
        completionRate,
        createdAt: course.createdAt
      };
    });

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

