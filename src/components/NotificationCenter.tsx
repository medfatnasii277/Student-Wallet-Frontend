import React, { useEffect, useState } from 'react';
import { Badge, ListGroup } from 'react-bootstrap';
import { Bell } from 'lucide-react';
import { Notification, NotificationService } from '../services/notificationService';

interface NotificationCenterProps {
  username: string;
}

const NotificationCenter: React.FC<NotificationCenterProps> = ({ username }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    // Initialize WebSocket connection only when username is available
    if (username) {
      NotificationService.initializeWebSocket(username, handleNewNotification);
    }
    
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
    // Optimistically update UI
    setNotifications(prev =>
      prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
    );
    setUnreadCount(prev => Math.max(0, prev - 1));
    // Call backend and reload notifications
    try {
      await NotificationService.markNotificationAsRead(notificationId);
      await loadNotifications();
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
    <div style={{ position: 'relative', display: 'inline-block' }}>
      <button
        type="button"
        onClick={() => setIsOpen(prev => !prev)}
        style={{
          background: 'none',
          border: 'none',
          position: 'relative',
          cursor: 'pointer',
          padding: 0,
        }}
        aria-label="Toggle notifications"
      >
        <Bell size={24} />
        {unreadCount > 0 && (
          <span
            style={{
              position: 'absolute',
              top: '-4px',
              right: '-4px',
              background: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              width: '18px',
              height: '18px',
              fontSize: '11px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid #e3f2fd',
              zIndex: 2,
            }}
          >
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>
      {isOpen && (
        <div
          style={{
            position: 'absolute',
            top: '36px',
            right: 0,
            width: '350px',
            maxHeight: '400px',
            overflowY: 'auto',
            background: '#e3f2fd',
            boxShadow: '0 4px 24px rgba(33, 150, 243, 0.15)',
            borderRadius: '16px',
            zIndex: 9999,
            border: '1px solid #90caf9',
          }}
        >
          <div style={{ padding: '16px', borderBottom: '1px solid #90caf9', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <span style={{ fontWeight: 600 }}>Notifications</span>
            {unreadCount > 0 && (
              <button
                className="btn btn-sm btn-outline-primary"
                onClick={markAllAsRead}
                style={{ fontSize: '13px', padding: '4px 10px', borderRadius: '8px' }}
              >
                <Bell size={16} style={{ marginRight: 4 }} />
                Mark all read
              </button>
            )}
          </div>
          <div style={{ padding: 0 }}>
            {notifications.length === 0 ? (
              <div style={{ padding: '24px', textAlign: 'center', color: '#666' }}>
                No notifications
              </div>
            ) : (
              <ListGroup variant="flush">
                {notifications.slice(0, 10).map((notification) => (
                  <ListGroup.Item
                    key={notification.id}
                    className={`border-0 px-3 py-3 ${!notification.read ? 'bg-info bg-opacity-25' : ''}`}
                    action
                    onClick={() => markAsRead(notification.id)}
                    style={{
                      cursor: 'pointer',
                      borderRadius: '12px',
                      marginBottom: '8px',
                      background: !notification.read ? '#bbdefb' : '#e3f2fd',
                      transition: 'background 0.2s',
                      boxShadow: !notification.read ? '0 2px 8px rgba(33,150,243,0.08)' : 'none',
                      width: '100%',
                      boxSizing: 'border-box',
                      minWidth: 0,
                      maxWidth: '100%',
                      display: 'block',
                    }}
                    onMouseEnter={e => e.currentTarget.style.background = '#90caf9'}
                    onMouseLeave={e => e.currentTarget.style.background = !notification.read ? '#bbdefb' : '#e3f2fd'}
                  >
                    <div className="d-flex align-items-start">
                      <span className="me-2 fs-5">{getNotificationIcon(notification.type)}</span>
                      <div className="flex-grow-1">
                        <div className="d-flex justify-content-between align-items-start">
                          <h6 className={`mb-1 ${!notification.read ? 'fw-bold' : ''}`}>{notification.title}</h6>
                          <small className="text-muted">{formatDate(notification.createdAt)}</small>
                        </div>
                        <p className="mb-1 small">
                          {notification.type === 'DOCUMENT_SHARED' && notification.sender && notification.document
                            ? `${notification.sender.username} shared with you document '${notification.document.name}'`
                            : notification.message}
                        </p>
                        {notification.sender && (
                          <small className="text-muted">From: {notification.sender.username}</small>
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
            <div style={{ padding: '8px', borderTop: '1px solid #90caf9', textAlign: 'center' }}>
              <small style={{ color: '#666' }}>
                Showing 10 of {notifications.length} notifications
              </small>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default NotificationCenter; 