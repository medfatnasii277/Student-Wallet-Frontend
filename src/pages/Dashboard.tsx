import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import api from "../services/api";
import ProfileModal from "../components/ProfileModal";
import ChatRooms from "../components/ChatRooms";
import ChatRoom from "../components/ChatRoom";
import DocumentList from "../components/DocumentList";
import NotificationCenter from "../components/NotificationCenter";
import FileSummary from "../components/FileSummary";

const Dashboard = () => {
  // ...existing code...
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [username, setUsername] = useState<string>('');
  // ...existing code...
  // ...existing code...
  // ...existing code...
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'chat' | 'summary'>('files');
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
    <motion.div 
      className="main-content" 
      style={{ 
        minHeight: '100vh',
        backgroundColor: 'transparent'
      }}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Top Bar */}
      <motion.div 
        style={{
          background: 'linear-gradient(135deg, rgba(254, 254, 254, 0.1) 0%, rgba(240, 249, 255, 0.15) 25%, rgba(254, 243, 199, 0.1) 50%, rgba(240, 249, 255, 0.15) 75%, rgba(254, 254, 254, 0.1) 100%)',
          backdropFilter: 'blur(25px)',
          borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
          padding: 'var(--spacing-sm) var(--spacing-xl)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          position: 'sticky',
          top: 0,
          zIndex: 100,
          boxShadow: '0 2px 12px rgba(0, 0, 0, 0.06)',
          WebkitBackdropFilter: 'blur(25px)', // Safari support
          minHeight: '56px',
          transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
        }}
        initial={{ y: -100, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        whileHover={{
          background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(22, 163, 74, 0.2) 25%, rgba(34, 197, 94, 0.15) 50%, rgba(22, 163, 74, 0.2) 75%, rgba(34, 197, 94, 0.15) 100%)',
          boxShadow: '0 4px 20px rgba(34, 197, 94, 0.15)',
          borderBottom: '1px solid rgba(34, 197, 94, 0.3)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-md)' }}>
          <motion.div 
            style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 'var(--spacing-sm)',
              cursor: 'pointer'
            }}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300 }}
          >
            <motion.h1 
              style={{ 
                fontSize: '1.8rem', 
                fontWeight: 800, 
                color: 'var(--primary)',
                margin: 0,
                background: 'linear-gradient(135deg, var(--primary), var(--accent))',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
                letterSpacing: '-0.02em',
                textShadow: '0 2px 4px rgba(0,0,0,0.1)'
              }}
              whileHover={{ scale: 1.05 }}
            >
              Student Wallet
            </motion.h1>
          </motion.div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-lg)' }}>
          {profilePic ? (
            <motion.img
              src={profilePic}
              alt="Profile"
              onClick={() => setIsProfileModalOpen(true)}
              style={{ 
                width: "36px", 
                height: "36px", 
                borderRadius: "50%", 
                objectFit: "cover",
                cursor: "pointer",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                transition: "all 0.3s ease"
              }}
              whileHover={{ 
                scale: 1.1,
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)"
              }}
              whileTap={{ scale: 0.95 }}
            />
          ) : (
            <motion.div
              onClick={() => setIsProfileModalOpen(true)}
              style={{ 
                width: "36px", 
                height: "36px", 
                borderRadius: "50%", 
                background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.8), rgba(244, 114, 182, 0.8))',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1.1rem',
                cursor: "pointer",
                border: "2px solid rgba(255, 255, 255, 0.3)",
                boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
                color: 'white',
                fontWeight: 'bold'
              }}
              whileHover={{ 
                scale: 1.1,
                boxShadow: "0 4px 15px rgba(0, 0, 0, 0.15)"
              }}
              whileTap={{ scale: 0.95 }}
            >
              👤
            </motion.div>
          )}
          
          {/* Notification Center */}
          <NotificationCenter username={username} />
          
          <motion.button 
            onClick={handleLogout}
            style={{
              padding: '6px var(--spacing-sm)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              color: 'rgba(239, 68, 68, 0.9)',
              cursor: 'pointer',
              fontSize: '0.8rem',
              fontWeight: '600',
              backdropFilter: 'blur(10px)',
              transition: 'all 0.3s ease'
            }}
            whileHover={{ 
              scale: 1.05, 
              backgroundColor: 'rgba(239, 68, 68, 0.8)', 
              color: 'white',
              boxShadow: '0 4px 15px rgba(239, 68, 68, 0.3)'
            }}
            whileTap={{ scale: 0.95 }}
          >
            Logout
          </motion.button>
        </div>
      </motion.div>

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
          <motion.button
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📁 Files
          </motion.button>
          <motion.button
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
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            💬 Chat Rooms
          </motion.button>
          <motion.button
            onClick={() => setActiveTab('summary')}
            style={{
              padding: 'var(--spacing-md) var(--spacing-lg)',
              backgroundColor: activeTab === 'summary' ? 'var(--primary)' : 'transparent',
              color: activeTab === 'summary' ? 'white' : 'var(--text-primary)',
              border: 'none',
              borderRadius: 'var(--radius-md) var(--radius-md) 0 0',
              cursor: 'pointer',
              fontSize: '0.875rem',
              fontWeight: 500,
              transition: 'all 0.2s ease'
            }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            📝 File Summary
          </motion.button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {/* Files Tab */}
          {activeTab === 'files' && (
            <motion.div
              key="files"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                border: '1px solid var(--border)',
                marginBottom: 'var(--spacing-xl)'
              }}>
                <DocumentList />
              </div>
            </motion.div>
          )}

          {/* Chat Tab */}
          {activeTab === 'chat' && (
            <motion.div
              key="chat"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
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
            </motion.div>
          )}

          {/* File Summary Tab */}
          {activeTab === 'summary' && (
            <motion.div
              key="summary"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              <div style={{
                backgroundColor: 'var(--surface)',
                borderRadius: 'var(--radius-lg)',
                padding: 'var(--spacing-xl)',
                border: '1px solid var(--border)',
                marginBottom: 'var(--spacing-xl)'
              }}>
                {/* FileSummary component will be rendered here */}
                <FileSummary />
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Profile Modal */}
      <ProfileModal 
        isOpen={isProfileModalOpen}
        onClose={() => setIsProfileModalOpen(false)}
        onProfileUpdate={handleProfileUpdate}
      />
    </motion.div>
  );
};

export default Dashboard;
