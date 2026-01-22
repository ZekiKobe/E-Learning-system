import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import InstructorRequest, { RequestStatus } from '../models/InstructorRequest';
import User, { UserRole } from '../models/User';

export const createRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    if (req.user.role === UserRole.INSTRUCTOR || req.user.role === UserRole.ADMIN) {
      return res.status(400).json({ error: 'You are already an instructor or admin' });
    }

    // Check if there's already a pending request
    const existingRequest = await InstructorRequest.findOne({
      where: { userId: req.user.id, status: RequestStatus.PENDING }
    });

    if (existingRequest) {
      return res.status(400).json({ error: 'You already have a pending instructor request' });
    }

    const { message } = req.body;

    const request = await InstructorRequest.create({
      userId: req.user.id,
      message,
      status: RequestStatus.PENDING
    });

    res.status(201).json(request);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const getMyRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Not authenticated' });
    }

    const request = await InstructorRequest.findOne({
      where: { userId: req.user.id },
      order: [['createdAt', 'DESC']]
    });

    res.json(request);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getAllRequests = async (req: AuthRequest, res: Response) => {
  try {
    const { status } = req.query;
    const where: any = {};
    if (status) where.status = status;

    const requests = await InstructorRequest.findAll({
      where,
      order: [['createdAt', 'DESC']]
    });

    res.json(requests);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const approveRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Only admins can approve requests' });
    }

    const { id } = req.params;
    const request = await InstructorRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== RequestStatus.PENDING) {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    // Update request status
    await request.update({
      status: RequestStatus.APPROVED,
      reviewedBy: req.user.id,
      reviewedAt: new Date()
    });

    // Update user role to instructor
    const targetUser = await User.findByPk(request.userId);
    if (targetUser) {
      await targetUser.update({ role: UserRole.INSTRUCTOR });
    }

    res.json(request);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

export const rejectRequest = async (req: AuthRequest, res: Response) => {
  try {
    if (!req.user || req.user.role !== UserRole.ADMIN) {
      return res.status(403).json({ error: 'Only admins can reject requests' });
    }

    const { id } = req.params;
    const { rejectionReason } = req.body;
    const request = await InstructorRequest.findByPk(id);

    if (!request) {
      return res.status(404).json({ error: 'Request not found' });
    }

    if (request.status !== RequestStatus.PENDING) {
      return res.status(400).json({ error: 'Request is not pending' });
    }

    await request.update({
      status: RequestStatus.REJECTED,
      reviewedBy: req.user.id,
      reviewedAt: new Date(),
      rejectionReason
    });

    res.json(request);
  } catch (error: any) {
    res.status(400).json({ error: error.message });
  }
};

