import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware';
import { dbStore } from '../db/store';

export const getNotifications = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    const notifications = await dbStore.getNotifications(userId);
    const unreadCount = notifications.filter(n => !n.isRead).length;

    res.json({
      success: true,
      count: notifications.length,
      unreadCount,
      notifications,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const { id } = req.params;
    const userId = req.user._id;

    await dbStore.markNotificationRead(id, userId);
    res.json({ success: true, message: 'Notification marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const markAllRead = async (req: AuthenticatedRequest, res: Response) => {
  try {
    const userId = req.user._id;
    await dbStore.markAllNotificationsRead(userId);

    res.json({ success: true, message: 'All notifications marked as read' });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};
