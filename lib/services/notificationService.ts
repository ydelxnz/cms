import { 
  getNotifications as fetchNotifications,
  getAllNotifications as fetchAllNotifications,
  markNotificationAsRead,
  markAllNotificationsAsRead,
  deleteNotification,
  deleteAllNotifications,
  createNotification,
  bulkDeleteNotifications as apiBulkDeleteNotifications
} from './api';
import { Notification } from '@/lib/db';

export interface NotificationWithTimeAgo extends Notification {
  timeAgo: string;
  userName?: string;
}

// 计算时间差
const getTimeAgo = (date: string): string => {
  const now = new Date();
  const past = new Date(date);
  const diffInSeconds = Math.floor((now.getTime() - past.getTime()) / 1000);
  
  if (diffInSeconds < 60) {
    return `${diffInSeconds}秒前`;
  }
  
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes}分钟前`;
  }
  
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours}小时前`;
  }
  
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 30) {
    return `${diffInDays}天前`;
  }
  
  const diffInMonths = Math.floor(diffInDays / 30);
  if (diffInMonths < 12) {
    return `${diffInMonths}个月前`;
  }
  
  const diffInYears = Math.floor(diffInMonths / 12);
  return `${diffInYears}年前`;
};

// 获取通知列表
export const getNotifications = async (unreadOnly = false): Promise<NotificationWithTimeAgo[]> => {
  try {
    const notifications = await fetchNotifications(unreadOnly);
    return notifications.map((notification: Notification) => ({
      ...notification,
      timeAgo: getTimeAgo(notification.createdAt)
    }));
  } catch (error) {
    console.error('获取通知失败:', error);
    return [];
  }
};

// 管理员获取所有通知（包括所有用户的通知）
export const getAllNotifications = async (filters: {
  userId?: string;
  type?: string;
  status?: string;
  sortOrder?: 'asc' | 'desc';
} = {}): Promise<{
  notifications: NotificationWithTimeAgo[];
  stats: {
    total: number;
    unread: number;
    system: number;
    booking: number;
    photo: number;
    order: number;
  };
}> => {
  try {
    const result = await fetchAllNotifications(filters);
    
    // 为通知添加timeAgo字段
    const notificationsWithTimeAgo = result.notifications.map((notification: any) => ({
      ...notification,
      timeAgo: getTimeAgo(notification.createdAt)
    }));
    
    return {
      notifications: notificationsWithTimeAgo,
      stats: result.stats
    };
  } catch (error) {
    console.error('管理员获取所有通知失败:', error);
    return {
      notifications: [],
      stats: {
        total: 0,
        unread: 0,
        system: 0,
        booking: 0,
        photo: 0,
        order: 0
      }
    };
  }
};

// 获取未读通知数量
export const getUnreadCount = async (): Promise<number> => {
  try {
    const notifications = await fetchNotifications(true);
    return notifications.length;
  } catch (error) {
    console.error('获取未读通知数量失败:', error);
    return 0;
  }
};

// 标记通知为已读
export const markAsRead = async (id: string): Promise<boolean> => {
  try {
    await markNotificationAsRead(id);
    return true;
  } catch (error) {
    console.error('标记通知已读失败:', error);
    return false;
  }
};

// 标记所有通知为已读
export const markAllAsRead = async (): Promise<boolean> => {
  try {
    await markAllNotificationsAsRead();
    return true;
  } catch (error) {
    console.error('标记所有通知已读失败:', error);
    return false;
  }
};

// 删除通知
export const removeNotification = async (id: string): Promise<boolean> => {
  try {
    await deleteNotification(id);
    return true;
  } catch (error) {
    console.error('删除通知失败:', error);
    return false;
  }
};

// 删除所有通知
export const clearAllNotifications = async (): Promise<boolean> => {
  try {
    await deleteAllNotifications();
    return true;
  } catch (error) {
    console.error('删除所有通知失败:', error);
    return false;
  }
};

// 管理员批量删除通知
export const bulkDeleteNotifications = async (
  options: {
    notificationIds?: string[];
    filters?: {
      userId?: string;
      type?: string;
      status?: string;
    };
  }
): Promise<boolean> => {
  try {
    await apiBulkDeleteNotifications(options);
    return true;
  } catch (error) {
    console.error('批量删除通知失败:', error);
    return false;
  }
};

// 创建通知（仅管理员可用）
export const sendNotification = async (data: {
  userId: string;
  title: string;
  message: string;
  type: "booking" | "photo" | "order" | "system";
}): Promise<boolean> => {
  try {
    await createNotification(data);
    return true;
  } catch (error) {
    console.error('发送通知失败:', error);
    return false;
  }
}; 