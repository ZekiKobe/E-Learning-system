import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Quiz from '../models/Quiz';
import Question from '../models/Question';
import QuizAttempt, { AttemptStatus } from '../models/QuizAttempt';
import Course from '../models/Course';
import Enrollment from '../models/Enrollment';

// Create quiz
export const createQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { courseId, lessonId, title, description, passingScore, timeLimit, maxAttempts } = req.body;
    const userId = req.user?.id;

    // Verify user is instructor of the course
    const course = await Course.findOne({ where: { id: courseId, instructorId: userId } });
    if (!course) {
      return res.status(403).json({ error: 'You can only create quizzes for your own courses' });
    }

    const quiz = await Quiz.create({
      courseId,
      lessonId,
      title,
      description,
      passingScore: passingScore || 70,
      timeLimit,
      maxAttempts
    });

    res.status(201).json(quiz);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get quiz with questions
export const getQuiz = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const quiz = await Quiz.findByPk(id, {
      include: [
        {
          model: Question,
          as: 'questions',
          order: [['order', 'ASC']]
        }
      ]
    });

    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check if user is enrolled
    if (userId) {
      const enrollment = await Enrollment.findOne({
        where: { userId, courseId: quiz.courseId }
      });
      if (!enrollment && req.user?.role !== 'admin' && req.user?.role !== 'instructor') {
        return res.status(403).json({ error: 'You must be enrolled to view this quiz' });
      }
    }

    res.json(quiz);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Add question to quiz
export const addQuestion = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const { question, type, points, order, options, correctAnswer, explanation } = req.body;
    const userId = req.user?.id;

    const quiz = await Quiz.findByPk(Number(quizId), { include: [{ model: Course, as: 'course' }] });
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    const course = (quiz as any).course;
    if (course.instructorId !== userId && req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Unauthorized' });
    }

    const questionRecord = await Question.create({
      quizId: Number(quizId),
      question,
      type,
      points: points || 1,
      order: order || 0,
      options: options ? JSON.stringify(options) : undefined,
      correctAnswer: correctAnswer ? JSON.stringify(correctAnswer) : undefined,
      explanation
    });

    res.status(201).json(questionRecord);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Start quiz attempt
export const startQuizAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const quiz = await Quiz.findByPk(Number(quizId));
    if (!quiz) {
      return res.status(404).json({ error: 'Quiz not found' });
    }

    // Check enrollment
    const enrollment = await Enrollment.findOne({
      where: { userId, courseId: quiz.courseId }
    });
    if (!enrollment) {
      return res.status(403).json({ error: 'You must be enrolled to take this quiz' });
    }

    // Check max attempts
    if (quiz.maxAttempts) {
      const attempts = await QuizAttempt.count({
        where: { userId, quizId, status: AttemptStatus.COMPLETED }
      });
      if (attempts >= quiz.maxAttempts) {
        return res.status(403).json({ error: 'Maximum attempts reached' });
      }
    }

    const attempt = await QuizAttempt.create({
      userId,
      quizId: Number(quizId),
      status: AttemptStatus.IN_PROGRESS,
      startedAt: new Date()
    });

    res.status(201).json(attempt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Submit quiz attempt
export const submitQuizAttempt = async (req: AuthRequest, res: Response) => {
  try {
    const { attemptId } = req.params;
    const { answers } = req.body;
    const userId = req.user?.id;

    const attempt = await QuizAttempt.findByPk(Number(attemptId), {
      include: [{ model: Quiz, as: 'quiz', include: [{ model: Question, as: 'questions' }] }]
    });

    if (!attempt || attempt.userId !== userId) {
      return res.status(404).json({ error: 'Attempt not found' });
    }

    if (attempt.status === AttemptStatus.COMPLETED) {
      return res.status(400).json({ error: 'Attempt already completed' });
    }

    // Calculate score
    let score = 0;
    let totalScore = 0;
    const quiz = (attempt as any).quiz;
    const questions = quiz.questions;

    for (const question of questions) {
      totalScore += question.points;
      const userAnswer = answers[question.id];
      const correctAnswer = question.correctAnswer ? JSON.parse(question.correctAnswer) : null;

      if (userAnswer && correctAnswer) {
        if (Array.isArray(correctAnswer)) {
          if (JSON.stringify(userAnswer.sort()) === JSON.stringify(correctAnswer.sort())) {
            score += question.points;
          }
        } else if (userAnswer === correctAnswer) {
          score += question.points;
        }
      }
    }

    const percentage = totalScore > 0 ? (score / totalScore) * 100 : 0;
    const passed = percentage >= quiz.passingScore;

    attempt.score = score;
    attempt.totalScore = totalScore;
    attempt.percentage = percentage;
    attempt.passed = passed;
    attempt.status = AttemptStatus.COMPLETED;
    attempt.completedAt = new Date();
    attempt.answers = JSON.stringify(answers);
    await attempt.save();

    res.json(attempt);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get user's quiz attempts
export const getUserQuizAttempts = async (req: AuthRequest, res: Response) => {
  try {
    const { quizId } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const attempts = await QuizAttempt.findAll({
      where: { userId, quizId: Number(quizId) },
      include: [{ model: Quiz, as: 'quiz' }],
      order: [['createdAt', 'DESC']]
    });

    res.json(attempts);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

