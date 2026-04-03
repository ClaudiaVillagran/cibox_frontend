import client from '../api/client';

export const getNotifications = async ({ unreadOnly = false, limit = 20 } = {}) => {
  const response = await client.get('/notifications', {
    params: {
      unreadOnly,
      limit,
    },
  });

  return response.data;
};

export const markNotificationAsRead = async (notificationId) => {
  const response = await client.patch(`/notifications/${notificationId}/read`);
  return response.data;
};

export const markAllNotificationsAsRead = async () => {
  const response = await client.patch('/notifications/read-all');
  return response.data;
};