import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { notificationAPI } from '../../api';
import type { Notification } from '../../types';

export default function Notifications() {
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [showUnreadOnly, setShowUnreadOnly] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const userId = localStorage.getItem('userId') || '';

  useEffect(() => {
    if (userId) {
      fetchNotifications();
    }
  }, [userId, showUnreadOnly]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const data = await notificationAPI.getNotifications(userId);
      
      // Filter unread locally if needed
      const allNotifications = data.notifications || [];
      const filteredNotifications = showUnreadOnly 
        ? allNotifications.filter(n => !n.is_read)
        : allNotifications;
      
      setNotifications(filteredNotifications);
      setUnreadCount(data.unread_count || 0);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to fetch notifications');
    } finally {
      setLoading(false);
    }
  };

  const handleMarkAsRead = async (notificationId: string) => {
    try {
      await notificationAPI.markAsRead(userId, notificationId);
      await fetchNotifications(); // Refresh
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead(userId);
      await fetchNotifications(); // Refresh
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to mark all as read');
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read if unread
    if (!notification.is_read) {
      handleMarkAsRead(notification.notification_id);
    }

    // Navigate based on notification type
    if (notification.type === 'game_joined' || notification.type === 'game_full') {
      if (notification.related_id) {
        navigate(`/player/game/${notification.related_id}`);
      }
    } else if (notification.type === 'friend_request') {
      navigate('/player/friends');
    } else if (notification.type === 'new_message') {
      if (notification.related_id) {
        navigate(`/player/group/${notification.related_id}/chat`);
      }
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'game_joined':
        return '👥';
      case 'game_full':
        return '✅';
      case 'friend_request':
        return '👋';
      case 'new_message':
        return '💬';
      case 'rating_received':
        return '⭐';
      default:
        return '🔔';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading notifications...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-lg shadow-lg p-6">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Notifications</h1>
              {unreadCount > 0 && (
                <p className="text-sm text-gray-600 mt-1">
                  {unreadCount} unread notification{unreadCount !== 1 ? 's' : ''}
                </p>
              )}
            </div>
            {unreadCount > 0 && (
              <button
                onClick={handleMarkAllAsRead}
                className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
              >
                Mark All as Read
              </button>
            )}
          </div>

          {error && <p className="text-red-500 mb-4">{error}</p>}

          {/* Filter Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowUnreadOnly(!showUnreadOnly)}
              className={`px-4 py-2 rounded-lg ${
                showUnreadOnly
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700'
              }`}
            >
              {showUnreadOnly ? 'Show All' : 'Show Unread Only'}
            </button>
          </div>

          {/* Notifications List */}
          <div className="space-y-3">
            {notifications.map((notification) => (
              <div
                key={notification.notification_id}
                onClick={() => handleNotificationClick(notification)}
                className={`p-4 rounded-lg cursor-pointer transition ${
                  notification.is_read
                    ? 'bg-gray-50 hover:bg-gray-100'
                    : 'bg-blue-50 hover:bg-blue-100 border-l-4 border-blue-500'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className="text-2xl">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="font-semibold text-gray-800">{notification.message}</p>
                    <p className="text-sm text-gray-600 mt-1">
                      {new Date(notification.created_at).toLocaleString()}
                    </p>
                  </div>
                  {!notification.is_read && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleMarkAsRead(notification.notification_id);
                      }}
                      className="px-3 py-1 text-sm bg-blue-500 text-white rounded hover:bg-blue-600"
                    >
                      Mark Read
                    </button>
                  )}
                </div>
              </div>
            ))}

            {notifications.length === 0 && (
              <div className="text-center text-gray-500 py-12">
                <div className="text-6xl mb-4">🔔</div>
                <p>
                  {showUnreadOnly
                    ? 'No unread notifications'
                    : 'No notifications yet'}
                </p>
              </div>
            )}
          </div>

          <button
            onClick={() => navigate('/player/dashboard')}
            className="mt-6 px-6 py-3 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    </div>
  );
}
