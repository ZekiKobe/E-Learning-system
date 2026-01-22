import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Note from '../models/Note';
import Lesson from '../models/Lesson';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';

// Create note
export const createNote = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId, content, timestamp } = req.body;
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
      return res.status(403).json({ error: 'You must be enrolled to take notes' });
    }

    const note = await Note.create({
      userId,
      lessonId,
      content,
      timestamp
    });

    res.status(201).json(note);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get notes for a lesson
export const getLessonNotes = async (req: AuthRequest, res: Response) => {
  try {
    const { lessonId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const notes = await Note.findAll({
      where: { userId, lessonId },
      order: [['timestamp', 'ASC'], ['createdAt', 'ASC']]
    });

    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all user notes
export const getUserNotes = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const notes = await Note.findAll({
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

    res.json(notes);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Update note
export const updateNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const note = await Note.findOne({ where: { id, userId } });
    if (!note) {
      return res.status(404).json({ error: 'Note not found' });
    }

    note.content = content;
    await note.save();

    res.json(note);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete note
export const deleteNote = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const deleted = await Note.destroy({
      where: { id, userId }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Note not found' });
    }

    res.json({ message: 'Note deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

