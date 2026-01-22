import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Bookmark from '../models/Bookmark';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';

// Create bookmark
export const createBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId, timestamp, note } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const lesson = await Lesson.findByPk(lessonId, {
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
      return res.status(403).json({ error: 'You must be enrolled to bookmark lessons' });
    }

    const bookmark = await Bookmark.create({
      userId,
      lessonId,
      timestamp,
      note
    });

    res.status(201).json(bookmark);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get bookmarks for a lesson
export const getLessonBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const bookmarks = await Bookmark.findAll({
      where: { userId, lessonId },
      order: [['timestamp', 'ASC']]
    });

    res.json(bookmarks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all user bookmarks
export const getUserBookmarks = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const bookmarks = await Bookmark.findAll({
      where: { userId },
      include: [
        {
          model: Lesson,
          as: 'lesson',
          attributes: ['id', 'title'],
          include: [
            {
              model: Course,
              as: 'course',
              attributes: ['id', 'title']
            }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(bookmarks);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete bookmark
export const deleteBookmark = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const deleted = await Bookmark.destroy({
      where: { id, userId }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Bookmark not found' });
    }

    res.json({ message: 'Bookmark deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

