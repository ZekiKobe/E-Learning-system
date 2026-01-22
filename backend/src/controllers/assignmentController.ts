import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Assignment from '../models/Assignment';
import Submission, { SubmissionStatus } from '../models/Submission';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';
import User from '../models/User';

// Create assignment
export const createAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId, title, description, instructions, maxScore, dueDate, allowLateSubmission } = req.body;
    const userId = req.user?.id;

    const course = await Course.findOne({ where: { id: Number(courseId), instructorId: userId } });
    if (!course) {
      return res.status(403).json({ error: 'You can only create assignments for your own courses' });
    }

    const assignment = await Assignment.create({
      courseId,
      lessonId,
      title,
      description,
      instructions,
      maxScore: maxScore || 100,
      dueDate,
      allowLateSubmission: allowLateSubmission !== false
    });

    res.status(201).json(assignment);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get assignments for a course
export const getCourseAssignments = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId } = req.params;
    const userId = req.user?.id;

    // Check enrollment
    if (userId) {
      const enrollment = await Enrollment.findOne({ where: { userId, courseId } });
      const course = await Course.findByPk(courseId);
      if (!enrollment && course?.instructorId !== userId && req.user?.role !== 'admin') {
        return res.status(403).json({ error: 'You must be enrolled to view assignments' });
      }
    }

    const assignments = await Assignment.findAll({
      where: { courseId },
      order: [['createdAt', 'DESC']]
    });

    res.json(assignments);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Submit assignment
export const submitAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const { content, fileUrl } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const assignment = await Assignment.findByPk(assignmentId, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: { userId, courseId: assignment.courseId }
    });
    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled to submit assignments' });
    }

    // Check if already submitted
    let submission = await Submission.findOne({
      where: { userId, assignmentId }
    });

    if (submission) {
      submission.content = content;
      submission.fileUrl = fileUrl;
      submission.status = SubmissionStatus.SUBMITTED;
      submission.submittedAt = new Date();
      await submission.save();
    } else {
      submission = await Submission.create({
        userId,
        assignmentId: Number(assignmentId),
        content,
        fileUrl,
        status: SubmissionStatus.SUBMITTED
      });
    }

    res.json(submission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Grade assignment (instructor)
export const gradeAssignment = async (req: AuthRequest, res: Response) => {
  try {
    const { submissionId } = req.params;
    const { score, feedback } = req.body;
    const userId = req.user?.id;

    const submission = await Submission.findByPk(submissionId, {
      include: [
        { model: Assignment, as: 'assignment', include: [{ model: Course, as: 'course' }] }
      ]
    });

    if (!submission) {
      return res.status(404).json({ error: 'Submission not found' });
    }

    const assignment = (submission as any).assignment;
    const course = assignment.course;
    if (course.instructorId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    submission.score = score;
    submission.feedback = feedback;
    submission.status = SubmissionStatus.GRADED;
    submission.gradedAt = new Date();
    await submission.save();

    res.json(submission);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get submissions for an assignment (instructor)
export const getAssignmentSubmissions = async (req: AuthRequest, res: Response) => {
  try {
    const { assignmentId } = req.params;
    const userId = req.user?.id;

    const assignment = await Assignment.findByPk(assignmentId, {
      include: [{ model: Course, as: 'course' }]
    });

    if (!assignment) {
      return res.status(404).json({ error: 'Assignment not found' });
    }

    const course = (assignment as any).course;
    if (course.instructorId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const submissions = await Submission.findAll({
      where: { assignmentId },
      include: [{ model: User, as: 'user', attributes: ['id', 'firstName', 'lastName', 'email'] }],
      order: [['submittedAt', 'DESC']]
    });

    res.json(submissions);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

