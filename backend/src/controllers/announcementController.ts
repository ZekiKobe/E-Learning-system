import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Announcement from '../models/Announcement';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import { createNotification } from './notificationController';
import { NotificationType } from '../models/Notification';

// Create announcement
export const createAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, title, content, isPinned } = req.body;
    const userId = req.user?.id;

    const course = await Course.findOne({ where: { id: courseId, instructorId: userId } });
    if (!course) {
      return res.status(403).json({ error: 'You can only create announcements for your own courses' });
    }

    const announcement = await Announcement.create({
      courseId,
      instructorId: userId!,
      title,
      content,
      isPinned: isPinned || false
    });

    // Notify enrolled students
    const enrollments = await Enrollment.findAll({
      where: { courseId },
      attributes: ['userId']
    });

    for (const enrollment of enrollments) {
      await createNotification(
        enrollment.userId,
        NotificationType.ANNOUNCEMENT,
        title,
        content,
        `/courses/${courseId}`,
        { courseId, announcementId: announcement.id }
      );
    }

    res.status(201).json(announcement);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get course announcements
export const getCourseAnnouncements = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    // Check enrollment
    if (userId) {
      const enrollment = await Enrollment.findOne({ where: { userId, courseId } });
      const course = await Course.findByPk(courseId);
      if (!enrollment && course?.instructorId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'You must be enrolled to view announcements' });
      }
    }

    const announcements = await Announcement.findAll({
      where: { courseId },
      include: [
        {
          model: Course,
          as: 'course',
          attributes: ['id', 'title']
        }
      ],
      order: [
        ['isPinned', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    res.json(announcements);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update announcement
export const updateAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { title, content, isPinned } = req.body;
    const userId = req.user?.id;

    const announcement = await Announcement.findByPk(id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const course = (announcement as any).course;
    if (course.instructorId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    if (title) announcement.title = title;
    if (content) announcement.content = content;
    if (isPinned !== undefined) announcement.isPinned = isPinned;
    await announcement.save();

    res.json(announcement);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete announcement
export const deleteAnnouncement = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const announcement = await Announcement.findByPk(id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!announcement) {
      return res.status(404).json({ error: 'Announcement not found' });
    }

    const course = (announcement as any).course;
    if (course.instructorId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    await announcement.destroy();

    res.json({ message: 'Announcement deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

