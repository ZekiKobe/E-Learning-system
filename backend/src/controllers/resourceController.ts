import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Resource, { ResourceType } from '../models/Resource';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import Lesson from '../models/Lesson';

// Create resource
export const createResource = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId, title, description, type, fileUrl, externalUrl } = req.body;
    const userId = req.user?.id;

    const course = await Course.findOne({ where: { id: courseId, instructorId: userId } });
    if (!course) {
      return res.status(403).json({ error: 'You can only add resources to your own courses' });
    }

    const resource = await Resource.create({
      courseId,
      lessonId,
      title,
      description,
      type,
      fileUrl,
      externalUrl
    });

    res.status(201).json(resource);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get course resources
export const getCourseResources = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { lessonId } = req.query;
    const userId = req.user?.id;

    // Check enrollment
    if (userId) {
      const enrollment = await Enrollment.findOne({ where: { userId, courseId } });
      const course = await Course.findByPk(courseId);
      if (!enrollment && course?.instructorId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'You must be enrolled to view resources' });
      }
    }

    const where: any = { courseId };
    if (lessonId) where.lessonId = lessonId;

    const resources = await Resource.findAll({
      where,
      include: [
        { model: Lesson, as: 'lesson', attributes: ['id', 'title'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(resources);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Download resource (increment download count)
export const downloadResource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const resource = await Resource.findByPk(Number(id), {
      include: [{ model: Course, as: 'course' }]
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    // Check enrollment
    if (userId) {
      const enrollment = await Enrollment.findOne({
        where: { userId, courseId: resource.courseId }
      });
      const course = (resource as any).course;
      if (!enrollment && course.instructorId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'You must be enrolled to download resources' });
      }
    }

    resource.downloadCount += 1;
    await resource.save();

    res.json(resource);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete resource
export const deleteResource = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const resource = await Resource.findByPk(Number(id), {
      include: [{ model: Course, as: 'course' }]
    });

    if (!resource) {
      return res.status(404).json({ error: 'Resource not found' });
    }

    const course = (resource as any).course;
    if (course.instructorId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await resource.destroy();

    res.json({ message: 'Resource deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

