import { useEffect, useState } from "react";
import api from "../services/api";
import ProfileModal from "../components/ProfileModal";
import ChatRooms from "../components/ChatRooms";
import ChatRoom from "../components/ChatRoom";

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
              fontWeight: 500
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
            {/* Upload Section */}
            <div style={{
              backgroundColor: 'var(--surface)',
              borderRadius: 'var(--radius-lg)',
              padding: 'var(--spacing-xl)',
              marginBottom: 'var(--spacing-xl)',
              border: '1px solid var(--border)'
            }}>
              <div style={{ 
                border: '2px dashed var(--border)',
                borderRadius: 'var(--radius-md)',
                padding: 'var(--spacing-xl)',
                textAlign: 'center',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                position: 'relative'
              }}>
                <input 
                  type="file" 
                  onChange={handleFileChange}
                  style={{ 
                    position: 'absolute',
                    width: '100%',
                    height: '100%',
                    top: 0,
                    left: 0,
                    opacity: 0,
                    cursor: 'pointer',
                    zIndex: 1
                  }}
                />
                <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-md)' }}>📁</div>
                <h3 style={{ 
                  margin: 0, 
                  color: 'var(--text-primary)',
                  fontSize: '1.25rem',
                  fontWeight: 500
                }}>
                  Drag files here or click to upload
                </h3>
                <p style={{ 
                  margin: 'var(--spacing-sm) 0 0 0', 
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem'
                }}>
                  Upload your educational files and documents
                </p>
              </div>
              
              {selectedFile && (
                <div style={{ 
                  marginTop: 'var(--spacing-md)',
                  padding: 'var(--spacing-md)',
                  backgroundColor: 'var(--background)',
                  borderRadius: 'var(--radius-md)',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  position: 'relative',
                  zIndex: 2
                }}>
                  <span style={{ 
                    color: 'var(--text-primary)',
                    fontSize: '0.875rem'
                  }}>
                    Selected: {selectedFile.name}
                  </span>
                  <button
                    onClick={handleUpload}
                    disabled={isUploading}
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: isUploading ? 'var(--border)' : 'var(--primary)',
                      color: 'white',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)',
                      cursor: isUploading ? 'not-allowed' : 'pointer',
                      fontSize: '0.875rem',
                      fontWeight: 500,
                      opacity: isUploading ? 0.6 : 1,
                      position: 'relative',
                      zIndex: 3
                    }}
                  >
                    {isUploading ? 'Uploading...' : 'Upload File'}
                  </button>
                </div>
              )}
            </div>

            {/* Files Grid */}
            <div style={{ marginBottom: 'var(--spacing-xl)' }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: 'var(--spacing-lg)'
              }}>
                <h2 style={{ 
                  margin: 0, 
                  fontSize: '1.25rem',
                  fontWeight: 500,
                  color: 'var(--text-primary)'
                }}>
                  My Files
                </h2>
                <div style={{ 
                  display: 'flex', 
                  gap: 'var(--spacing-sm)',
                  color: 'var(--text-secondary)',
                  fontSize: '0.875rem'
                }}>
                  <span>{files.length} items</span>
                  <span>•</span>
                  <span>{files.reduce((acc, file) => acc + (file.docTag?.length || 0), 0)} tags</span>
                </div>
              </div>

              {files.length > 0 ? (
                <div style={{ 
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
                  gap: 'var(--spacing-md)'
                }}>
                  {files.map((file: any) => (
                    <div 
                      key={file.id} 
                      style={{
                        backgroundColor: 'var(--surface)',
                        borderRadius: 'var(--radius-md)',
                        padding: 'var(--spacing-md)',
                        border: '1px solid var(--border)',
                        cursor: 'pointer',
                        transition: 'all 0.2s ease'
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.transform = 'translateY(-2px)';
                        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.1)';
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.transform = 'translateY(0)';
                        e.currentTarget.style.boxShadow = 'none';
                      }}
                    >
                      <div style={{ 
                        fontSize: '2rem', 
                        marginBottom: 'var(--spacing-sm)',
                        textAlign: 'center'
                      }}>
                        📄
                      </div>
                      <h4 style={{ 
                        margin: '0 0 var(--spacing-sm) 0',
                        fontSize: '0.875rem',
                        fontWeight: 500,
                        color: 'var(--text-primary)',
                        textAlign: 'center',
                        wordBreak: 'break-word'
                      }}>
                        {file.name}
                      </h4>
                      <div style={{ 
                        fontSize: '0.75rem',
                        color: 'var(--text-secondary)',
                        textAlign: 'center',
                        marginBottom: 'var(--spacing-sm)'
                      }}>
                        {new Date(file.uploadDate).toLocaleDateString()}
                      </div>
                      {file.docTag && file.docTag.length > 0 && (
                        <div style={{ 
                          display: 'flex', 
                          flexWrap: 'wrap',
                          gap: 'var(--spacing-xs)',
                          marginBottom: 'var(--spacing-sm)',
                          justifyContent: 'center'
                        }}>
                          {file.docTag.map((tag: any, index: number) => (
                            <span 
                              key={index}
                              style={{
                                backgroundColor: 'var(--primary)',
                                color: 'white',
                                padding: '2px 6px',
                                borderRadius: 'var(--radius-sm)',
                                fontSize: '0.625rem',
                                fontWeight: 500
                              }}
                            >
                              {tag.name}
                            </span>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: 'var(--spacing-xs)' }}>
                        <button 
                          onClick={() => handleDownload(file.id, file.name)}
                          style={{
                            flex: 1,
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            backgroundColor: 'var(--primary)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          Download
                        </button>
                        <button 
                          onClick={() => handleDelete(file.id)}
                          style={{
                            padding: 'var(--spacing-xs) var(--spacing-sm)',
                            backgroundColor: 'var(--danger)',
                            color: 'white',
                            border: 'none',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            cursor: 'pointer',
                            transition: 'all 0.2s ease'
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div style={{ 
                  textAlign: 'center', 
                  padding: 'var(--spacing-xl)',
                  backgroundColor: 'var(--surface)',
                  borderRadius: 'var(--radius-lg)',
                  border: '1px solid var(--border)'
                }}>
                  <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-md)' }}>📁</div>
                  <h3 style={{ 
                    margin: 0, 
                    color: 'var(--text-primary)',
                    fontSize: '1.25rem',
                    fontWeight: 500
                  }}>
                    No files yet
                  </h3>
                  <p style={{ 
                    margin: 'var(--spacing-sm) 0 0 0', 
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem'
                  }}>
                    Upload your first file to get started
                  </p>
                </div>
              )}

              {files.length > 0 && (
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'center',
                  alignItems: 'center',
                  gap: 'var(--spacing-md)',
                  marginTop: 'var(--spacing-xl)'
                }}>
                  <button
                    onClick={() => setPage((prev) => Math.max(prev - 1, 0))}
                    disabled={page === 0}
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      cursor: page === 0 ? 'not-allowed' : 'pointer',
                      opacity: page === 0 ? 0.5 : 1
                    }}
                  >
                    Previous
                  </button>

                  <span style={{ 
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem'
                  }}>
                    Page {page + 1} of {totalPages}
                  </span>

                  <button
                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages - 1))}
                    disabled={page >= totalPages - 1}
                    style={{
                      padding: 'var(--spacing-sm) var(--spacing-md)',
                      backgroundColor: 'var(--surface)',
                      border: '1px solid var(--border)',
                      borderRadius: 'var(--radius-md)',
                      color: 'var(--text-primary)',
                      cursor: page >= totalPages - 1 ? 'not-allowed' : 'pointer',
                      opacity: page >= totalPages - 1 ? 0.5 : 1
                    }}
                  >
                    Next
                  </button>
                </div>
              )}
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
