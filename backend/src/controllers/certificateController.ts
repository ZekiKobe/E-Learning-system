import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Enrollment from '../models/Enrollment';
import Course from '../models/Course';
import Lesson from '../models/Lesson';
import User from '../models/User';

export const generateCertificate = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const { courseId } = req.params;
    const enrollment = await Enrollment.findOne({
      where: { userId: req.user.id, courseId: Number(courseId) }
    });

    if (!enrollment) {
      return res.status(404).json({ error: 'Enrollment not found' });
    }

    if (!enrollment.completed) {
      return res.status(400).json({ error: 'Course must be completed to generate certificate' });
    }

    const course = await Course.findByPk(courseId, {
      include: [{ model: User, as: 'instructor', attributes: ['firstName', 'lastName'] }]
    });

    if (!course) {
      return res.status(404).json({ error: 'Course not found' });
    }

    // Generate certificate data (in production, you'd use a PDF library like pdfkit or puppeteer)
    const certificateData = {
      studentName: `${req.user.firstName} ${req.user.lastName}`,
      courseTitle: course.title,
      instructorName: `${(course as any).instructor.firstName} ${(course as any).instructor.lastName}`,
      completionDate: enrollment.completedAt || new Date(),
      certificateId: `ELS-${courseId}-${req.user.id}-${Date.now()}`
    };

    // For now, return JSON. In production, generate PDF and return file
    res.json({
      message: 'Certificate generated successfully',
      certificate: certificateData,
      downloadUrl: `/api/certificates/${certificateData.certificateId}/download`
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const downloadCertificate = async (req: AuthRequest, res: Response) => {
  try {
    const { certificateId } = req.params;
    // In production, generate PDF and stream it
    // For now, return JSON
    res.json({ message: 'Certificate download endpoint - PDF generation coming soon', certificateId });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

