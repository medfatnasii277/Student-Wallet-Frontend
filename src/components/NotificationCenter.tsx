import React, { useEffect, useState } from 'react';
import { Badge, Dropdown, ListGroup } from 'react-bootstrap';
import { Bell, Check, CheckDouble } from 'lucide-react';
import { Notification, NotificationService } from '../services/notificationService';

interface NotificationCenterProps {
  username: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ username }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection
    NotificationService.initializeWebSocket(username, handleNewNotification);
    
    // Load initial notifications
    loadNotifications();
    
    // Cleanup on unmount
    return () => {
      NotificationService.disconnect();
    };
  }, [username]);

  const handleNewNotification = (notification: Notification) => {
    setNotifications(prev => [notification, ...prev]);
    setUnreadCount(prev => prev + 1);
  };

  const loadNotifications = async () => {
    try {
      const [allNotifications, count] = await Promise.all([
        NotificationService.getNotifications(),
        NotificationService.getUnreadNotificationCount()
      ]);
      setNotifications(allNotifications);
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading notifications:', error);
    }
  };

  const markAsRead = async (notificationId: number) => {
    try {
      await NotificationService.markNotificationAsRead(notificationId);
      setNotifications(prev => 
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
      setUnreadCount(prev => Math.max(0, prev - 1));
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await NotificationService.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 1) {
      return 'Just now';
    } else if (diffInHours < 24) {
      return `${Math.floor(diffInHours)}h ago`;
    } else {
      return date.toLocaleDateString();
    }
  };

  const getNotificationIcon = (type: Notification['type']) => {
    switch (type) {
      case 'DOCUMENT_SHARED':
        return '📄';
      case 'DOCUMENT_ACCESSED':
        return '👁️';
      case 'SYSTEM_MESSAGE':
        return 'ℹ️';
      default:
        return '🔔';
    }
  };

  return (
    <Dropdown show={isOpen} onToggle={(isOpen: boolean) => setIsOpen(isOpen)}>
      <Dropdown.Toggle 
        variant="outline-secondary" 
        className="position-relative"
        onClick={() => setIsOpen(!isOpen)}
      >
        <Bell size={20} />
        {unreadCount > 0 && (
          <Badge 
            bg="danger" 
            className="position-absolute top-0 start-100 translate-middle"
            style={{ fontSize: '0.7rem' }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </Badge>
        )}
      </Dropdown.Toggle>

      <Dropdown.Menu 
        show={isOpen} 
        className="p-0"
        style={{ width: '350px', maxHeight: '400px', overflowY: 'auto' }}
      >
        <div className="p-3 border-bottom">
          <div className="d-flex justify-content-between align-items-center">
            <h6 className="mb-0">Notifications</h6>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={markAllAsRead}
              >
                <CheckDouble size={16} className="me-1" />
                Mark all read
              </button>
            )}
          </div>
        </div>

        <div className="p-0">
          {notifications.length === 0 ? (
            <div className="p-3 text-center text-muted">
              No notifications
            </div>
          ) : (
            <ListGroup variant="flush">
              {notifications.slice(0, 10).map((notification) => (
                <ListGroup.Item
                  key={notification.id}
                  className={`border-0 px-3 py-2 ${!notification.read ? 'bg-light' : ''}`}
                  action
                  onClick={() => markAsRead(notification.id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex align-items-start">
                    <span className="me-2 fs-5">{getNotificationIcon(notification.type)}</span>
                    <div className="flex-grow-1">
                      <div className="d-flex justify-content-between align-items-start">
                        <h6 className={`mb-1 ${!notification.read ? 'fw-bold' : ''}`}>
                          {notification.title}
                        </h6>
                        <small className="text-muted">
                          {formatDate(notification.createdAt)}
                        </small>
                      </div>
                      <p className="mb-1 small">{notification.message}</p>
                      {notification.sender && (
                        <small className="text-muted">
                          From: {notification.sender.username}
                        </small>
                      )}
                    </div>
                    {!notification.read && (
                      <div className="ms-2">
                        <div className="bg-primary rounded-circle" style={{ width: '8px', height: '8px' }}></div>
                      </div>
                    )}
                  </div>
                </ListGroup.Item>
              ))}
            </ListGroup>
          )}
        </div>

        {notifications.length > 10 && (
          <div className="p-2 border-top text-center">
            <small className="text-muted">
              Showing 10 of {notifications.length} notifications
            </small>
          </div>
        )}
      </Dropdown.Menu>
    </Dropdown>
  );
};

export default NotificationCenter; 