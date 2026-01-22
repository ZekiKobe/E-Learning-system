import { Response } from 'express';
import { Op } from 'sequelize';
import { AuthRequest } from '../middleware/auth';
import Refund, { RefundStatus } from '../models/Refund';
import Payment from '../models/Payment';
import Enrollment from '../models/Enrollment';
import { createNotification } from './notificationController';
import { NotificationType } from '../models/Notification';

// Request refund
export const requestRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { paymentId, reason } = req.body;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const payment = await Payment.findOne({
      where: { id: paymentId, userId, status: 'success' }
    });

    if (!payment) {
      return res.status(404).json({ error: 'Payment not found or not eligible for refund' });
    }

    // Check if refund already requested
    const existingRefund = await Refund.findOne({
      where: { paymentId, status: { [Op.ne]: RefundStatus.REJECTED } }
    });

    if (existingRefund) {
      return res.status(400).json({ error: 'Refund already requested for this payment' });
    }

    const refund = await Refund.create({
      userId,
      paymentId,
      amount: payment.amount,
      reason,
      status: RefundStatus.REQUESTED
    });

    // Notify admin
    // You can add admin notification here

    res.status(201).json(refund);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get user refunds
export const getUserRefunds = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const refunds = await Refund.findAll({
      where: { userId },
      include: [
        {
          model: Payment,
          as: 'payment',
          attributes: ['id', 'amount', 'currency', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(refunds);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get all refunds (admin)
export const getAllRefunds = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const refunds = await Refund.findAll({
      include: [
        {
          model: Payment,
          as: 'payment',
          attributes: ['id', 'amount', 'currency', 'createdAt']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    res.json(refunds);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Process refund (admin)
export const processRefund = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const { status, adminNotes } = req.body;

    if (req.user?.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const refund = await Refund.findByPk(id, {
      include: [
        {
          model: Payment,
          as: 'payment'
        }
      ]
    });

    if (!refund) {
      return res.status(404).json({ error: 'Refund not found' });
    }

    if (status === RefundStatus.APPROVED || status === RefundStatus.PROCESSED) {
      // Process refund logic here (integrate with payment provider)
      refund.status = status;
      refund.processedAt = new Date();
      if (adminNotes) refund.adminNotes = adminNotes;

      // Remove enrollment if refund is processed
      if (status === RefundStatus.PROCESSED) {
        const payment = (refund as any).payment;
        await Enrollment.destroy({
          where: {
            userId: refund.userId,
            courseId: payment.courseId
          }
        });

        // Notify user
        await createNotification(
          refund.userId,
          NotificationType.PAYMENT_SUCCESS,
          'Refund Processed',
          `Your refund of ${refund.amount} has been processed.`,
          `/refunds/${refund.id}`
        );
      }
    } else if (status === RefundStatus.REJECTED) {
      refund.status = status;
      if (adminNotes) refund.adminNotes = adminNotes;

      await createNotification(
        refund.userId,
        NotificationType.PAYMENT_FAILED,
        'Refund Rejected',
        `Your refund request has been rejected. ${adminNotes || ''}`,
        `/refunds/${refund.id}`
      );
    }

    await refund.save();

    res.json(refund);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

