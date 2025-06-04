import React, { useEffect, useState } from "react";
import api from "../services/api";

const Dashboard = () => {
  const [files, setFiles] = useState<any[]>([]);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [profilePic, setProfilePic] = useState<string | null>(null);
  const [username, setUsername] = useState<string>("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

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
        setUsername(response.data.username);

        if (response.data.profilePicture) {
          setProfilePic(`data:image/png;base64,${response.data.profilePicture}`);
        }
      } catch (err) {
        console.error("Error fetching profile picture", err);
      }
    };

    fetchProfileData();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      alert("Please select a file to upload.");
      return;
    }

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      await api.post("/upload", formData, { headers: { "Content-Type": "multipart/form-data" } });
      alert("File uploaded successfully!");
      fetchFiles(page);
    } catch (err) {
      console.error("Error uploading file", err);
      alert("File upload failed.");
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
              style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                objectFit: "cover"
              }}
            />
          ) : (
            <div
              style={{ 
                width: "32px", 
                height: "32px", 
                borderRadius: "50%", 
                backgroundColor: "var(--border)",
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '1rem'
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
            transition: 'all 0.2s ease'
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
                cursor: 'pointer'
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
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                    e.currentTarget.style.transform = 'translateY(-2px)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.boxShadow = 'none';
                    e.currentTarget.style.transform = 'none';
                  }}
                >
                  <div style={{ 
                    width: '40px',
                    height: '40px',
                    backgroundColor: 'var(--primary-light)',
                    borderRadius: 'var(--radius-sm)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 'var(--spacing-sm)'
                  }}>
                    📄
                  </div>
                  <div style={{ 
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)',
                    marginBottom: 'var(--spacing-xs)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}>
                    {file.name}
                  </div>
                  {file.docTag?.length > 0 && (
                    <div style={{ 
                      display: 'flex', 
                      gap: 'var(--spacing-xs)',
                      flexWrap: 'wrap'
                    }}>
                      {file.docTag.map((tag: any) => (
                        <span 
                          key={tag.id} 
                          style={{ 
                            backgroundColor: 'var(--background)',
                            color: 'var(--text-secondary)',
                            padding: '2px 6px',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem'
                          }}
                        >
                          {tag.name}
                        </span>
                      ))}
                    </div>
                  )}
                  <button 
                    onClick={() => handleDownload(file.id, file.name)}
                    style={{
                      width: '100%',
                      marginTop: 'var(--spacing-sm)',
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
      </div>
    </div>
  );
};

export default Dashboard;
