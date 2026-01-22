import { Response } from 'express';
import { AuthRequest } from '../middleware/auth';
import Notification, { NotificationType } from '../models/Notification';
import { Op } from 'sequelize';

// Get user notifications
export const getNotifications = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;
    const { read, limit = 50 } = req.query;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const where: any = { userId };
    if (read !== undefined) {
      where.read = read === 'true';
    }

    const notifications = await Notification.findAll({
      where,
      limit: Number(limit),
      order: [['createdAt', 'DESC']]
    });

    res.json(notifications);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Mark notification as read
export const markAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const notification = await Notification.findOne({
      where: { id, userId }
    });

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    notification.read = true;
    await notification.save();

    res.json(notification);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Mark all as read
export const markAllAsRead = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    await Notification.update(
      { read: true },
      { where: { userId, read: false } }
    );

    res.json({ message: 'All notifications marked as read' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Get unread count
export const getUnreadCount = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.user?.id;

    if (!userId) {
      return res.json({ count: 0 });
    }

    const count = await Notification.count({
      where: { userId, read: false }
    });

    res.json({ count });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Delete notification
export const deleteNotification = async (req: AuthRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    if (!userId) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const deleted = await Notification.destroy({
      where: { id, userId }
    });

    if (deleted === 0) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    res.json({ message: 'Notification deleted' });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

// Helper function to create notification (used by other controllers)
export async function createNotification(
  userId: number,
  type: NotificationType,
  title: string,
  message: string,
  link?: string,
  metadata?: object
) {
  return await Notification.create({
    userId,
    type,
    title,
    message,
    link,
    metadata
  });
}

