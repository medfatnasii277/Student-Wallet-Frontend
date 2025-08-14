import { useState, useEffect, useRef } from 'react';
import api from '../services/api';

interface Message {
  id: number;
  content: string;
  sender: {
    username: string;
  };
  createdAt: string;
}

interface Room {
  id: number;
  name: string;
  isPrivate: boolean;
  creatorUsername: string;
  memberCount: number;
}

interface ChatRoomProps {
  room: Room;
  onBack: () => void;
}

const ChatRoom: React.FC<ChatRoomProps> = ({ room, onBack }) => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [isMember, setIsMember] = useState<boolean | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [username, setUsername] = useState('');

  useEffect(() => {
    fetchMessages();
    fetchUsername();
    const interval = setInterval(fetchMessages, 5000); // Refresh every 5 seconds
    return () => clearInterval(interval);
  }, [room.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const fetchUsername = async () => {
    try {
      const response = await api.get('/profile-picture');
      setUsername(response.data.username);
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  const fetchMessages = async () => {
    try {
      const response = await api.get(`/rooms/${room.id}/messages/latest`);
      setMessages(response.data.reverse()); // Show oldest first
      setIsMember(true);
    } catch (error: any) {
      console.error('Error fetching messages:', error);
      
      // If user can't access messages (not a member), show appropriate message
      if (error.response?.data?.message?.includes('must join')) {
        setMessages([]);
        setIsMember(false);
        // Don't show error alert here, just log it
      } else {
        setIsMember(null);
        alert('Failed to fetch messages: ' + (error.response?.data?.message || 'Unknown error'));
      }
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    setLoading(true);
    try {
      await api.post(`/rooms/${room.id}/messages`, { content: newMessage.trim() });
      setNewMessage('');
      fetchMessages();
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to send message';
      
      // If user needs to join the room first, show a helpful message
      if (errorMessage.includes('must join') || errorMessage.includes('Join room first')) {
        if (confirm('You need to join this room first before sending messages. Would you like to join now?')) {
          try {
            // Try to join the room (public rooms don't need password)
            if (!room.isPrivate) {
              await api.post(`/rooms/${room.id}/join`, {});
              alert('Successfully joined the room! You can now send messages.');
              // Refresh messages after joining
              fetchMessages();
            } else {
              alert('This is a private room. You need to join with a password first.');
            }
          } catch (joinError: any) {
            alert('Failed to join room: ' + (joinError.response?.data?.message || 'Unknown error'));
          }
        }
      } else {
        alert(errorMessage);
      }
    } finally {
      setLoading(false);
    }
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60);
    
    if (diffInHours < 24) {
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } else {
      return date.toLocaleDateString();
    }
  };

  return (
    <div style={{
      backgroundColor: 'var(--surface)',
      borderRadius: 'var(--radius-lg)',
      border: '1px solid var(--border)',
      height: '100%',
      display: 'flex',
      flexDirection: 'column'
    }}>
      {/* Room Header */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        gap: 'var(--spacing-md)'
      }}>
        <button
          onClick={onBack}
          style={{
            padding: 'var(--spacing-sm)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: 'pointer',
            fontSize: '1.25rem',
            color: 'var(--text-secondary)'
          }}
        >
          ←
        </button>
        
        <div style={{ flex: 1 }}>
          <h3 style={{
            margin: '0 0 var(--spacing-xs) 0',
            fontSize: '1.125rem',
            fontWeight: 500,
            color: 'var(--text-primary)'
          }}>
            {room.name}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: 'var(--spacing-sm)',
            fontSize: '0.75rem',
            color: 'var(--text-secondary)'
          }}>
            <span style={{
              backgroundColor: room.isPrivate ? 'var(--warning)' : 'var(--success)',
              color: 'white',
              padding: '2px 6px',
              borderRadius: 'var(--radius-sm)',
              fontSize: '0.625rem',
              fontWeight: 500
            }}>
              {room.isPrivate ? '🔒 Private' : '🌐 Public'}
            </span>
            <span>👤 {room.memberCount} members</span>
            <span>•</span>
            <span>Created by {room.creatorUsername}</span>
          </div>
        </div>
        
        <button
          onClick={() => {
            setRefreshing(true);
            fetchMessages().finally(() => setRefreshing(false));
          }}
          disabled={refreshing}
          style={{
            padding: 'var(--spacing-sm)',
            backgroundColor: 'transparent',
            border: 'none',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            fontSize: '1rem',
            color: refreshing ? 'var(--border)' : 'var(--text-secondary)',
            transition: 'all 0.2s ease'
          }}
        >
          {refreshing ? '⟳' : '↻'}
        </button>
      </div>

      {/* Messages Area */}
      <div style={{
        flex: 1,
        overflowY: 'auto',
        padding: 'var(--spacing-md)',
        display: 'flex',
        flexDirection: 'column',
        gap: 'var(--spacing-sm)'
      }}>
        {messages.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>💬</div>
            <p>No messages yet</p>
            <p style={{ fontSize: '0.875rem' }}>Be the first to say something!</p>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                maxWidth: '80%',
                alignSelf: message.sender.username === username ? 'flex-end' : 'flex-start'
              }}
            >
              <div style={{
                backgroundColor: message.sender.username === username ? 'var(--primary)' : 'var(--background)',
                color: message.sender.username === username ? 'white' : 'var(--text-primary)',
                padding: 'var(--spacing-sm) var(--spacing-md)',
                borderRadius: 'var(--radius-md)',
                border: message.sender.username === username ? 'none' : '1px solid var(--border)',
                wordBreak: 'break-word'
              }}>
                <div style={{
                  fontSize: '0.875rem',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  {message.content}
                </div>
              </div>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-xs)',
                marginTop: 'var(--spacing-xs)',
                fontSize: '0.75rem',
                color: 'var(--text-secondary)',
                alignSelf: message.sender.username === username ? 'flex-end' : 'flex-start'
              }}>
                <span>{message.sender.username}</span>
                <span>•</span>
                <span>{formatTime(message.createdAt)}</span>
              </div>
            </div>
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderTop: '1px solid var(--border)'
      }}>
        {isMember === false ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-md)',
            backgroundColor: 'var(--warning-light)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid var(--warning)'
          }}>
            <p style={{
              margin: '0 0 var(--spacing-sm) 0',
              color: 'var(--warning-dark)',
              fontSize: '0.875rem'
            }}>
              🔒 You need to join this room to send messages
            </p>
            {!room.isPrivate ? (
              <button
                onClick={async () => {
                  try {
                    await api.post(`/rooms/${room.id}/join`, {});
                    alert('Successfully joined the room! You can now send messages.');
                    fetchMessages();
                  } catch (error: any) {
                    alert('Failed to join room: ' + (error.response?.data?.message || 'Unknown error'));
                  }
                }}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Join Room
              </button>
            ) : (
              <p style={{
                margin: 0,
                color: 'var(--warning-dark)',
                fontSize: '0.75rem'
              }}>
                This is a private room. You need to join with a password first.
              </p>
            )}
          </div>
        ) : (
          <form onSubmit={handleSendMessage} style={{ display: 'flex', gap: 'var(--spacing-sm)' }}>
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type your message..."
              disabled={loading}
              style={{
                flex: 1,
                padding: 'var(--spacing-sm) var(--spacing-md)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.875rem',
                backgroundColor: 'var(--background)',
                color: 'var(--text-primary)'
              }}
            />
            <button
              type="submit"
              disabled={loading || !newMessage.trim()}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: loading || !newMessage.trim() ? 'var(--border)' : 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                cursor: loading || !newMessage.trim() ? 'not-allowed' : 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500,
                minWidth: '80px'
              }}
            >
              {loading ? 'Sending...' : 'Send'}
            </button>
          </form>
        )}
      </div>
    </div>
  );
};

export default ChatRoom; 