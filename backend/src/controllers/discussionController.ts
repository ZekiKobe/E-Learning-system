import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Discussion, { DiscussionType } from '../models/Discussion';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import User from '../models/User';
import Lesson from '../models/Lesson';

// Create discussion/question
export const createDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId, parentId, type, title, content } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const course = await Course.findByPk(courseId);
    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Check enrollment for students
    if (req.user?.role === 'student') {
      const enrollment = await Enrollment.findOne({ where: { userId, courseId } });
      if (!enrollment) {
        return res.status(403).json({ error: 'You must be enrolled to participate in discussions' });
      }
    }

    const discussion = await Discussion.create({
      userId,
      courseId,
      lessonId,
      parentId,
      type: type || DiscussionType.QUESTION,
      title,
      content
    });

    const created = await Discussion.findByPk(discussion.id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { model: Lesson, as: 'lesson', attributes: ['id', 'title'] }
      ]
    });

    res.status(201).json(created);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get discussions for a course
export const getCourseDiscussions = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const { lessonId, type, parentId } = req.query;

    const where: any = { courseId };
    if (lessonId) where.lessonId = lessonId;
    if (type) where.type = type;
    if (parentId) {
      where.parentId = parentId;
    } else {
      where.parentId = null; // Only top-level discussions
    }

    const discussions = await Discussion.findAll({
      where,
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { model: Lesson, as: 'lesson', attributes: ['id', 'title'] }
      ],
      order: [
        ['isPinned', 'DESC'],
        ['upvotes', 'DESC'],
        ['createdAt', 'DESC']
      ]
    });

    // Get replies for each discussion
    const discussionsWithReplies = await Promise.all(
      discussions.map(async (discussion) => {
        const replies = await Discussion.findAll({
          where: { parentId: discussion.id },
          include: [
            { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }
          ],
          order: [['createdAt', 'ASC']]
        });
        return { ...discussion.toJSON(), replies };
      })
    );

    res.json(discussionsWithReplies);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get single discussion with replies
export const getDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findByPk(id, {
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] },
        { model: Lesson, as: 'lesson', attributes: ['id', 'title'] },
        { model: Course, as: 'course', attributes: ['id', 'title'] }
      ]
    });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const replies = await Discussion.findAll({
      where: { parentId: id },
      include: [
        { model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'avatar'] }
      ],
      order: [['createdAt', 'ASC']]
    });

    res.json({ ...discussion.toJSON(), replies });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Upvote discussion
export const upvoteDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;

    const discussion = await Discussion.findByPk(id);
    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    discussion.upvotes += 1;
    await discussion.save();

    res.json(discussion);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Mark discussion as resolved (instructor)
export const resolveDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const discussion = await Discussion.findByPk(id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const course = (discussion as any).course;
    if (course.instructorId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    discussion.isResolved = true;
    await discussion.save();

    res.json(discussion);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Pin discussion (instructor)
export const pinDiscussion = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const discussion = await Discussion.findByPk(id, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!discussion) {
      return res.status(404).json({ error: 'Discussion not found' });
    }

    const course = (discussion as any).course;
    if (course.instructorId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    discussion.isPinned = !discussion.isPinned;
    await discussion.save();

    res.json(discussion);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

