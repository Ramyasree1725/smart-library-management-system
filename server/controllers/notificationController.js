import { dbStore } from '../data/store.js';

export const getNotifications = (req, res) => {
  try {
    const userId = req.user._id;
    const userNotifs = dbStore.notifications.filter(n => n.userId === userId);
    return res.json({
      success: true,
      unreadCount: userNotifs.filter(n => !n.read).length,
      notifications: userNotifs
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to fetch notifications' });
  }
};

export const markAsRead = (req, res) => {
  try {
    const { id } = req.params;
    const notif = dbStore.notifications.find(n => n._id === id);
    if (notif) {
      notif.read = true;
      dbStore.save();
    }
    return res.json({ success: true, message: 'Notification marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notification' });
  }
};

export const markAllAsRead = (req, res) => {
  try {
    const userId = req.user._id;
    dbStore.notifications.forEach(n => {
      if (n.userId === userId) {
        n.read = true;
      }
    });
    dbStore.save();
    return res.json({ success: true, message: 'All notifications marked as read' });
  } catch (error) {
    return res.status(500).json({ success: false, message: 'Failed to update notifications' });
  }
};
