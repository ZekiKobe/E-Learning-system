import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Lesson from '../models/Lesson';
import Course from '../models/Course';

export const getCourseLessons = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    const lessons = await Lesson.findAll({
      where: { courseId },
      order: [['order', 'ASC']]
    });

    res.json(lessons);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const createLesson = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { courseId } = req.params;
    const course = await Course.findByPk(courseId);

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is instructor or admin
    if (req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    const body = req.body as any;

    // If a video file is uploaded, set videoUrl to the static path
    if (req.file) {
      body.videoUrl = `/uploads/videos/${req.file.filename}`;
    }

    const lesson = await Lesson.create({
      title: body.title,
      description: body.description,
      type: body.type,
      content: body.content,
      videoUrl: body.videoUrl,
      duration: body.duration,
      order: body.order,
      isPreview: body.isPreview,
      courseId: course.id
    });

    res.status(201).json(lesson);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const updateLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findByPk(id);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const course = await Course.findByPk(lesson.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is instructor or admin
    if (req.user && req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await lesson.update(req.body);
    res.json(lesson);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const deleteLesson = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const lesson = await Lesson.findByPk(id);

    if (!lesson) {
      return res.status(404).json({ error: 'Lesson not found' });
    }

    const course = await Course.findByPk(lesson.courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check if user is instructor or admin
    if (req.user && req.user.role !== 'admin' && course.instructorId !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized' });
    }

    await lesson.destroy();
    res.json({ message: 'Lesson deleted successfully' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

