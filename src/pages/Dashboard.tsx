import { useEffect, useState } from "react";
import api from "../services/api";
import ProfileModal from "../components/ProfileModal";
import ChatRooms from "../components/ChatRooms";
import ChatRoom from "../components/ChatRoom";
import DocumentList from "../components/DocumentList";

const Dashboard = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isUploading, setIsUploading] = useState(false);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'files' | 'chat'>('files');
  const [selectedRoom, setSelectedRoom] = useState<any>(null);

  const fetchFiles = async (pageNumber: number) => {
    try {
      const response = await api.get(`/my-files?page=${pageNumber}&size=5`);
      setFiles(response.data.content);
      setTotalPages(response.data.totalPages);
    } catch (err) {
      console.error("Error fetching files", err);
    }
  };

  useEffect(() => {
    fetchFiles(page);
  }, [page]);

  useEffect(() => {
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

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
      console.log("File selected:", event.target.files[0].name);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    console.log("Starting upload for file:", selectedFile.name);
    setIsUploading(true);
    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      console.log("Sending POST request to /upload");
      const response = await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      console.log("Upload response:", response);
      alert("File uploaded successfully!");
      setSelectedFile(null); // Clear selected file after upload
      fetchFiles(page);
    } catch (err) {
      console.error("Error uploading file", err);
      alert("File upload failed.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownload = async (fileId: number, fileName: string) => {
    try {
      const response = await api.get(`/download/${fileId}`, { responseType: "blob" });
      const url = window.URL.createObjectURL(response.data);
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute("download", fileName);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error downloading file", err);
      alert("File download failed.");
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/login";
  };

  const handleDelete = async (fileId: number) => {
    if (window.confirm("Are you sure you want to delete this file?")) {
      try {
        await api.delete(`/delete/${fileId}`);
        alert("File deleted successfully!");
        fetchFiles(page);
      } catch (err) {
        console.error("Error deleting file", err);
        alert("File deletion failed.");
      }
    }
  };

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
          <div style={{
            position: 'relative',
            cursor: 'pointer',
            padding: '8px',
            borderRadius: '50%',
            backgroundColor: 'var(--surface)',
            border: '1px solid var(--border)',
            transition: 'all 0.2s ease'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--background)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'var(--surface)';
          }}
          >
            🔔
            {/* Notification Badge */}
            <div style={{
              position: 'absolute',
              top: '-2px',
              right: '-2px',
              backgroundColor: '#dc3545',
              color: 'white',
              borderRadius: '50%',
              width: '16px',
              height: '16px',
              fontSize: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: '2px solid var(--surface)'
            }}>
              0
            </div>
          </div>
          
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
              <DocumentList onRefresh={() => fetchFiles(page)} />
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
