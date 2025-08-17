import { useEffect, useState } from "react";
import api from "../services/api";
import ProfileModal from "../components/ProfileModal";
import ChatRooms from "../components/ChatRooms";
import ChatRoom from "../components/ChatRoom";
import DocumentList from "../components/DocumentList";
import NotificationCenter from "../components/NotificationCenter";

const Dashboard = () => {
  // ...existing code...
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  // ...existing code...
  // ...existing code...
  // ...existing code...
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'chat'>('files');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);


  // Removed fetchFiles and page references for clean build
  // ...existing code...

  useEffect(() => {
    const fetchProfileData = async () => {
      try {
        const response = await api.get("/profile-picture");
        if (response.data.profilePicture) {
          setProfilePic(`data:image/png;base64,${response.data.profilePicture}`);
        }
        if (response.data.username) {
          setUsername(response.data.username);
        }
      } catch (err) {
        console.error("Error fetching profile picture", err);
      }
    };

    fetchProfileData();
  }, []);

  const handleProfileUpdate = () => {
    // Refresh profile picture when profile is updated
    const fetchProfileData = async () => {
      try {
        const response = await api.get("/profile-picture");
        if (response.data.profilePicture) {
          setProfilePic(`data:image/png;base64,${response.data.profilePicture}`);
        }
      } catch (err) {
        console.error("Error fetching profile picture", err);
      }
    };
    fetchProfileData();
  };

  // ...existing code...

  // ...existing code...

  // ...existing code...

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  // ...existing code...

  return (
    <div className="main-content" style={{ 
      backgroundColor: 'var(--background)',
      minHeight: '100vh'
    }}>
      {/* Top Bar */}
      <div style={{
        backgroundColor: 'var(--surface)',
        borderBottom: '1px solid var(--border)',
        padding: 'var(--spacing-md) var(--spacing-xl)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        position: 'sticky',
        top: 0,
        zIndex: 100
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <h1 style={{ 
            fontSize: '1.5rem', 
            fontWeight: 500, 
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Student Wallet
          </h1>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          {profilePic ? (
            <img
              src={profilePic}
              alt="Profile"
              onClick={() => setIsProfileModalOpen(true)}
              style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                objectFit: "cover",
                cursor: "pointer",
                border: "2px solid transparent",
                transition: "border-color 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "transparent";
              }}
            />
          ) : (
            <div
              onClick={() => setIsProfileModalOpen(true)}
              style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                backgroundColor: "var(--border)",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem',
                cursor: "pointer",
                border: "2px solid transparent",
                transition: "border-color 0.2s ease"
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "var(--primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "transparent";
              }}
            >
              👤
            </div>
          )}
          
          {/* Notification Center */}
          <NotificationCenter username={username} />
          
          <button 
            onClick={handleLogout}
            style={{
              padding: 'var(--spacing-sm) var(--spacing-md)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border)',
              backgroundColor: 'transparent',
              color: 'var(--text-primary)',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: '500'
            }}
          >
            Logout
          </button>
        </div>
      </div>

      <div style={{ 
        maxWidth: '1200px', 
        margin: '0 auto', 
        padding: 'var(--spacing-xl)'
      }}>
        {/* Navigation Tabs */}
        <div style={{
          display: 'flex',
          gap: 'var(--spacing-sm)',
          marginBottom: 'var(--spacing-xl)',
          borderBottom: '1px solid var(--border)'
        }}>
          <button
            onClick={() => setActiveTab('files')}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: activeTab === 'files' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'files' ? 'white' : 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            📁 Files
          </button>
          <button
            onClick={() => setActiveTab('chat')}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: activeTab === 'chat' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'chat' ? 'white' : 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
          >
            💬 Chat Rooms
          </button>
        </div>

        {/* Files Tab */}
        {activeTab === 'files' && (
          <>
            <div style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-xl)',
              border: '1px solid var(--border)',
              marginBottom: 'var(--spacing-xl)'
            }}>
              <DocumentList />
            </div>
          </>
        )}

        {/* Chat Tab */}
        {activeTab === 'chat' && (
          <div style={{ display: 'flex', gap: 'var(--spacing-xl)', height: '600px' }}>
            <div style={{ flex: '1', maxWidth: '400px' }}>
              <ChatRooms 
                onRoomSelect={setSelectedRoom}
                selectedRoom={selectedRoom}
              />
            </div>
            <div style={{ flex: '2' }}>
              {selectedRoom ? (
                <ChatRoom 
                  room={selectedRoom}
                  onBack={() => setSelectedRoom(null)}
                />
              ) : (
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  height: '100%',
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)',
                  color: 'var(--text-secondary)',
                  fontSize: '1.125rem'
                }}>
                  Select a chat room to start messaging
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </div>
  );
};

export default Dashboard;
