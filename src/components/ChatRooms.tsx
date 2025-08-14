import { useState, useEffect } from 'react';
import api from '../services/api';

interface Room {
  id: number;
  name: string;
  isPrivate: boolean;
  creatorUsername: string;
  memberCount: number;
  isCurrentUserMember: boolean;
}

interface Student {
  id: number;
  username: string;
  email: string;
}

interface ChatRoomsProps {
  onRoomSelect: (room: Room | null) => void;
  selectedRoom: Room | null;
}

const ChatRooms: React.FC<ChatRoomsProps> = ({ onRoomSelect, selectedRoom }) => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [isMembersModalOpen, setIsMembersModalOpen] = useState(false);
  const [selectedRoomToJoin, setSelectedRoomToJoin] = useState<Room | null>(null);
  const [selectedRoomForMembers, setSelectedRoomForMembers] = useState<Room | null>(null);
  const [roomMembers, setRoomMembers] = useState<Student[]>([]);
  const [currentUsername, setCurrentUsername] = useState<string>('');
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    isPrivate: false,
    password: ''
  });
  const [joinPassword, setJoinPassword] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchRooms();
    fetchCurrentUsername();
  }, []);

  const fetchCurrentUsername = async () => {
    try {
      const response = await api.get('/profile-picture');
      setCurrentUsername(response.data.username);
    } catch (error) {
      console.error('Error fetching username:', error);
    }
  };

  const fetchRooms = async () => {
    try {
      const response = await api.get('/rooms');
      setRooms(response.data);
    } catch (error) {
      console.error('Error fetching rooms:', error);
    }
  };

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    setLoading(true);
    try {
      const requestData = {
        name: formData.name.trim(),
        description: formData.description.trim(),
        isPrivate: formData.isPrivate,
        password: formData.isPrivate ? formData.password : undefined
      };

      await api.post('/rooms', requestData);
      setIsCreateModalOpen(false);
      setFormData({ name: '', description: '', isPrivate: false, password: '' });
      fetchRooms();
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to create room');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRoom = async (room: Room, password?: string) => {
    try {
      const joinData = password ? { password } : {};
      await api.post(`/rooms/${room.id}/join`, joinData);
      
      setIsJoinModalOpen(false);
      setJoinPassword('');
      setSelectedRoomToJoin(null);
      fetchRooms(); // Refresh the room list
      onRoomSelect(room); // Select the joined room
    } catch (error: any) {
      const errorMessage = error.response?.data?.message || 'Failed to join room';
      alert(errorMessage);
    }
  };

  const handleDeleteRoom = async (room: Room) => {
    if (!confirm(`Are you sure you want to delete "${room.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await api.delete(`/rooms/${room.id}`);
      fetchRooms();
      if (selectedRoom?.id === room.id) {
        onRoomSelect(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to delete room');
    }
  };

  const handleLeaveRoom = async (room: Room) => {
    if (!confirm(`Are you sure you want to leave "${room.name}"?`)) {
      return;
    }

    try {
      await api.post(`/rooms/${room.id}/leave`);
      fetchRooms();
      if (selectedRoom?.id === room.id) {
        onRoomSelect(null);
      }
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to leave room');
    }
  };

  const handleViewMembers = async (room: Room) => {
    try {
      const response = await api.get(`/rooms/${room.id}/members`);
      setRoomMembers(response.data);
      setSelectedRoomForMembers(room);
      setIsMembersModalOpen(true);
    } catch (error: any) {
      alert(error.response?.data?.message || 'Failed to fetch room members');
    }
  };

  const openJoinModal = (room: Room) => {
    setSelectedRoomToJoin(room);
    setIsJoinModalOpen(true);
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
      {/* Header */}
      <div style={{
        padding: 'var(--spacing-lg)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h3 style={{
          margin: 0,
          fontSize: '1.125rem',
          fontWeight: 500,
          color: 'var(--text-primary)'
        }}>
          Chat Rooms
        </h3>
        <button
          onClick={() => setIsCreateModalOpen(true)}
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
          + New Room
        </button>
      </div>

      {/* Rooms List */}
      <div style={{ flex: 1, overflowY: 'auto', padding: 'var(--spacing-md)' }}>
        {rooms.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'var(--spacing-xl)',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-sm)' }}>💬</div>
            <p>No chat rooms available</p>
            <p style={{ fontSize: '0.875rem' }}>Create the first one!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
            {rooms.map((room) => (
              <div
                key={room.id}
                onClick={() => onRoomSelect(room)}
                style={{
                  padding: 'var(--spacing-md)',
                  backgroundColor: selectedRoom?.id === room.id ? 'var(--primary-light)' : 'var(--background)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border)',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  position: 'relative'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = 'translateY(-1px)';
                  e.currentTarget.style.boxShadow = '0 2px 8px rgba(0, 0, 0, 0.1)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = 'translateY(0)';
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  marginBottom: 'var(--spacing-xs)'
                }}>
                  <h4 style={{
                    margin: 0,
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    flex: 1
                  }}>
                    {room.name}
                  </h4>
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
                </div>
                
                <p style={{
                  margin: 'var(--spacing-xs) 0',
                  fontSize: '0.75rem',
                  color: 'var(--text-secondary)'
                }}>
                  Created by {room.creatorUsername}
                </p>
                
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center'
                }}>
                  <span style={{
                    fontSize: '0.75rem',
                    color: 'var(--text-secondary)'
                  }}>
                    👥 {room.memberCount} members
                  </span>
                  
                  {room.isCurrentUserMember ? (
                    <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleViewMembers(room);
                        }}
                        style={{
                          padding: 'var(--spacing-xs) var(--spacing-sm)',
                          backgroundColor: 'var(--info)',
                          color: 'white',
                          border: 'none',
                          borderRadius: 'var(--radius-sm)',
                          cursor: 'pointer',
                          fontSize: '0.75rem'
                        }}
                      >
                        View Members
                      </button>
                      
                      {currentUsername === room.creatorUsername ? (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteRoom(room);
                          }}
                          style={{
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            backgroundColor: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Delete
                        </button>
                      ) : (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleLeaveRoom(room);
                          }}
                          style={{
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            backgroundColor: 'var(--warning)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Leave
                        </button>
                      )}
                    </div>
                  ) : (
                    <>
                      {!room.isPrivate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleJoinRoom(room);
                          }}
                          style={{
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Join
                        </button>
                      )}
                      
                      {room.isPrivate && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            openJoinModal(room);
                          }}
                          style={{
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            backgroundColor: 'var(--warning)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            cursor: 'pointer',
                            fontSize: '0.75rem'
                          }}
                        >
                          Join with Password
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Create Room Modal */}
      {isCreateModalOpen && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            width: '90%',
            maxWidth: '500px',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{
              margin: '0 0 var(--spacing-lg) 0',
              fontSize: '1.25rem',
              fontWeight: 500,
              color: 'var(--text-primary)'
            }}>
              Create New Chat Room
            </h3>
            
            <form onSubmit={handleCreateRoom}>
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)'
                }}>
                  Room Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem'
                  }}
                  placeholder="Enter room name"
                  required
                />
              </div>
              
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{
                  display: 'block',
                  marginBottom: 'var(--spacing-xs)',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)'
                }}>
                  Description
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  style={{
                    width: '100%',
                    padding: 'var(--spacing-sm)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.875rem',
                    minHeight: '80px',
                    resize: 'vertical'
                  }}
                  placeholder="Enter room description (optional)"
                />
              </div>
              
              <div style={{ marginBottom: 'var(--spacing-md)' }}>
                <label style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 'var(--spacing-sm)',
                  fontSize: '0.875rem',
                  color: 'var(--text-primary)',
                  cursor: 'pointer'
                }}>
                  <input
                    type="checkbox"
                    checked={formData.isPrivate}
                    onChange={(e) => setFormData({ ...formData, isPrivate: e.target.checked })}
                    style={{ margin: 0 }}
                  />
                  Private Room (requires password)
                </label>
              </div>
              
              {formData.isPrivate && (
                <div style={{ marginBottom: 'var(--spacing-md)' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    style={{
                      width: '100%',
                      padding: 'var(--spacing-sm)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.875rem'
                    }}
                    placeholder="Enter room password"
                    required={formData.isPrivate}
                  />
                </div>
              )}
              
              <div style={{
                display: 'flex',
                gap: 'var(--spacing-md)',
                justifyContent: 'flex-end'
              }}>
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: 'transparent',
                    color: 'var(--text-primary)',
                    border: '1px solid var(--border)',
                    borderRadius: 'var(--radius-md)',
                    cursor: 'pointer',
                    fontSize: '0.875rem'
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || !formData.name.trim()}
                  style={{
                    padding: 'var(--spacing-sm) var(--spacing-md)',
                    backgroundColor: loading ? 'var(--border)' : 'var(--primary)',
                    color: 'white',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    fontSize: '0.875rem',
                    fontWeight: 500
                  }}
                >
                  {loading ? 'Creating...' : 'Create Room'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Join Private Room Modal */}
      {isJoinModalOpen && selectedRoomToJoin && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            width: '90%',
            maxWidth: '400px',
            border: '1px solid var(--border)'
          }}>
            <h3 style={{
              margin: '0 0 var(--spacing-lg) 0',
              fontSize: '1.25rem',
              fontWeight: 500,
              color: 'var(--text-primary)'
            }}>
              Join Private Room
            </h3>
            
            <p style={{
              margin: '0 0 var(--spacing-md) 0',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)'
            }}>
              Enter the password to join <strong>{selectedRoomToJoin.name}</strong>
            </p>
            
            <div style={{ marginBottom: 'var(--spacing-lg)' }}>
              <label style={{
                display: 'block',
                marginBottom: 'var(--spacing-xs)',
                fontSize: '0.875rem',
                fontWeight: 500,
                color: 'var(--text-primary)'
              }}>
                Password
              </label>
              <input
                type="password"
                value={joinPassword}
                onChange={(e) => setJoinPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'var(--spacing-sm)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.875rem'
                }}
                placeholder="Enter room password"
                autoFocus
              />
            </div>
            
            <div style={{
              display: 'flex',
              gap: 'var(--spacing-md)',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => setIsJoinModalOpen(false)}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'transparent',
                  color: 'var(--text-primary)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  cursor: 'pointer',
                  fontSize: '0.875rem'
                }}
              >
                Cancel
              </button>
              <button
                onClick={() => handleJoinRoom(selectedRoomToJoin, joinPassword)}
                disabled={!joinPassword.trim()}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: !joinPassword.trim() ? 'var(--border)' : 'var(--primary)',
                  color: 'white',
                  border: 'none',
                  borderRadius: 'var(--radius-md)',
                  cursor: !joinPassword.trim() ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500
                }}
              >
                Join Room
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Room Members Modal */}
      {isMembersModalOpen && selectedRoomForMembers && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000
        }}>
          <div style={{
            backgroundColor: 'var(--surface)',
            borderRadius: 'var(--radius-lg)',
            padding: 'var(--spacing-xl)',
            width: '90%',
            maxWidth: '500px',
            border: '1px solid var(--border)',
            maxHeight: '80vh',
            overflow: 'hidden',
            display: 'flex',
            flexDirection: 'column'
          }}>
            <h3 style={{
              margin: '0 0 var(--spacing-lg) 0',
              fontSize: '1.25rem',
              fontWeight: 500,
              color: 'var(--text-primary)'
            }}>
              Room Members - {selectedRoomForMembers.name}
            </h3>
            
            <div style={{ flex: 1, overflowY: 'auto', marginBottom: 'var(--spacing-lg)' }}>
              {roomMembers.length === 0 ? (
                <p style={{ textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No members found
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--spacing-sm)' }}>
                  {roomMembers.map((member) => (
                    <div
                      key={member.id}
                      style={{
                        padding: 'var(--spacing-sm) var(--spacing-md)',
                        backgroundColor: 'var(--background)',
                        borderRadius: 'var(--radius-md)',
                        border: '1px solid var(--border)',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center'
                      }}
                    >
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          fontWeight: 500,
                          color: 'var(--text-primary)'
                        }}>
                          {member.username}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--text-secondary)'
                        }}>
                          {member.email}
                        </div>
                      </div>
                      
                      {member.username === selectedRoomForMembers.creatorUsername && (
                        <span style={{
                          backgroundColor: 'var(--primary)',
                          color: 'white',
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-sm)',
                          fontSize: '0.625rem',
                          fontWeight: 500
                        }}>
                          Creator
                        </span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
            
            <div style={{
              display: 'flex',
              justifyContent: 'flex-end'
            }}>
              <button
                onClick={() => {
                  setIsMembersModalOpen(false);
                  setSelectedRoomForMembers(null);
                  setRoomMembers([]);
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
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatRooms; 