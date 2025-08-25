import api from './api';
import SockJS from 'sockjs-client';
import { Client, IMessage, IStompSocket } from '@stomp/stompjs';

export interface Notification {
  id: number;
  recipient: {
    id: number;
    username: string;
  };
  sender?: {
    id: number;
    username: string;
  };
  document?: {
    id: number;
    name: string;
  };
  type: 'DOCUMENT_SHARED' | 'DOCUMENT_ACCESSED' | 'SYSTEM_MESSAGE';
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
  readAt?: string;
}

export class NotificationService {
  private static stompClient: Client | null = null;
  private static isConnected = false;
  private static notificationCallbacks: ((notification: Notification) => void)[] = [];

  // Initialize WebSocket connection
  static initializeWebSocket(_username: string, onNotification?: (notification: Notification) => void) {
    if (onNotification) {
      this.notificationCallbacks.push(onNotification);
    }

    if (this.isConnected) {
      return;
    }

    const socket = new SockJS('http://localhost:8080/ws');
    const token = localStorage.getItem('token');
    this.stompClient = new Client({
      webSocketFactory: () => socket as IStompSocket,
      debug: (str: string) => console.log(str),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      connectHeaders: token ? { Authorization: `Bearer ${token}` } : {},
    });

    this.stompClient.onConnect = () => {
      console.log('Connected to WebSocket');
      this.isConnected = true;

  // Subscribe to user-specific notifications
  // Spring's user destination mapping sends user messages to a server-side path
  // but clients should subscribe to the generic user queue destination '/user/queue/notifications'
  this.stompClient?.subscribe(`/user/queue/notifications`, (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);
          // Normalize payload to Notification interface shape when possible
          const notification: any = {
            id: payload.id,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            createdAt: payload.createdAt || new Date().toISOString(),
            read: payload.read || false,
            sender: payload.sender,
            document: payload.document
          };
          console.log('Received notification via user queue:', notification);
          this.notificationCallbacks.forEach(callback => callback(notification));
        } catch (error) {
          console.error('Error parsing notification:', error, message.body);
        }
      });

      // Subscribe to general notifications
      this.stompClient?.subscribe('/topic/notifications', (message: IMessage) => {
        try {
          const payload = JSON.parse(message.body);
          const notification: any = {
            id: payload.id,
            type: payload.type,
            title: payload.title,
            message: payload.message,
            createdAt: payload.createdAt || new Date().toISOString(),
            read: payload.read || false,
            sender: payload.sender,
            document: payload.document
          };
          console.log('Received notification via topic:', notification);
          this.notificationCallbacks.forEach(callback => callback(notification));
        } catch (error) {
          console.error('Error parsing notification:', error, message.body);
        }
      });
    };

    this.stompClient.onStompError = (frame: any) => {
      console.error('STOMP error:', frame);
      this.isConnected = false;
    };

    this.stompClient.onWebSocketError = (error: Event) => {
      console.error('WebSocket error:', error);
      this.isConnected = false;
    };

    this.stompClient.activate();
  }

  // Disconnect WebSocket
  static disconnect() {
    if (this.stompClient) {
      this.stompClient.deactivate();
      this.stompClient = null;
      this.isConnected = false;
    }
  }

  // Get all notifications for the current user
  static async getNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications');
    return response.data;
  }

  // Get unread notifications for the current user
  static async getUnreadNotifications(): Promise<Notification[]> {
    const response = await api.get('/notifications/unread');
    return response.data;
  }

  // Get unread notification count
  static async getUnreadNotificationCount(): Promise<number> {
    const response = await api.get('/notifications/unread/count');
    return response.data;
  }

  // Mark a notification as read
  static async markNotificationAsRead(notificationId: number): Promise<void> {
    await api.post(`/notifications/${notificationId}/read`);
  }

  // Mark all notifications as read
  static async markAllNotificationsAsRead(): Promise<void> {
    await api.post('/notifications/read-all');
  }

  // Remove notification callback
  static removeNotificationCallback(callback: (notification: Notification) => void) {
    const index = this.notificationCallbacks.indexOf(callback);
    if (index > -1) {
      this.notificationCallbacks.splice(index, 1);
    }
  }

  // Check if WebSocket is connected
  static getConnectionStatus(): boolean {
    return this.isConnected;
  }
} 