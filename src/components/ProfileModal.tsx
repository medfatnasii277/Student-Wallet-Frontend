import React, { useState, useEffect } from "react";
import api from "../services/api";

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProfileUpdate: () => void;
}

interface ProfileData {
  id: number;
  username: string;
  name: string;
  school?: string;
  specialty?: string;
  interests?: string;
  bio?: string;
  email?: string;
  phoneNumber?: string;
  yearOfStudy?: string;
  city?: string;
  profilePicture?: string;
}

const ProfileModal: React.FC<ProfileModalProps> = ({ isOpen, onClose, onProfileUpdate }) => {
  const [profileData, setProfileData] = useState<ProfileData | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    school: "",
    specialty: "",
    interests: "",
    bio: "",
    email: "",
    phoneNumber: "",
    yearOfStudy: "",
    city: "",
  });

  const fetchProfile = async () => {
    try {
      setIsLoading(true);
      const response = await api.get("/profile");
      setProfileData(response.data);
      setFormData({
        school: response.data.school || "",
        specialty: response.data.specialty || "",
        interests: response.data.interests || "",
        bio: response.data.bio || "",
        email: response.data.email || "",
        phoneNumber: response.data.phoneNumber || "",
        yearOfStudy: response.data.yearOfStudy || "",
        city: response.data.city || "",
      });
    } catch (err) {
      console.error("Error fetching profile", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchProfile();
    }
  }, [isOpen]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      await api.put("/profile", formData);
      await fetchProfile(); // Refresh profile data
      setIsEditing(false);
      onProfileUpdate(); // Notify parent component to update profile picture
      alert("Profile updated successfully!");
    } catch (err) {
      console.error("Error updating profile", err);
      alert("Failed to update profile.");
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    // Reset form data to original values
    if (profileData) {
      setFormData({
        school: profileData.school || "",
        specialty: profileData.specialty || "",
        interests: profileData.interests || "",
        bio: profileData.bio || "",
        email: profileData.email || "",
        phoneNumber: profileData.phoneNumber || "",
        yearOfStudy: profileData.yearOfStudy || "",
        city: profileData.city || "",
      });
    }
  };

  if (!isOpen) return null;

  return (
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
        width: '90%',
        maxWidth: '600px',
        maxHeight: '90vh',
        overflow: 'auto',
        border: '1px solid var(--border)'
      }}>
        {/* Header */}
        <div style={{
          padding: 'var(--spacing-lg)',
          borderBottom: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h2 style={{
            margin: 0,
            fontSize: '1.5rem',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}>
            My Profile
          </h2>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              fontSize: '1.5rem',
              cursor: 'pointer',
              color: 'var(--text-secondary)',
              padding: 'var(--spacing-xs)'
            }}
          >
            ×
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 'var(--spacing-lg)' }}>
          {isLoading ? (
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              color: 'var(--text-secondary)'
            }}>
              Loading profile...
            </div>
          ) : profileData ? (
            <>
              {/* Profile Picture and Basic Info */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 'var(--spacing-md)',
                marginBottom: 'var(--spacing-lg)',
                padding: 'var(--spacing-md)',
                backgroundColor: 'var(--background)',
                borderRadius: 'var(--radius-md)'
              }}>
                {profileData.profilePicture ? (
                  <img
                    src={`data:image/png;base64,${profileData.profilePicture}`}
                    alt="Profile"
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      objectFit: "cover",
                      border: '3px solid var(--primary)'
                    }}
                  />
                ) : (
                  <div
                    style={{
                      width: "80px",
                      height: "80px",
                      borderRadius: "50%",
                      backgroundColor: "var(--border)",
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '2rem',
                      border: '3px solid var(--primary)'
                    }}
                  >
                    👤
                  </div>
                )}
                <div>
                  <h3 style={{
                    margin: 0,
                    fontSize: '1.25rem',
                    color: 'var(--text-primary)'
                  }}>
                    {profileData.name}
                  </h3>
                  <p style={{
                    margin: '4px 0 0 0',
                    color: 'var(--text-secondary)',
                    fontSize: '0.875rem'
                  }}>
                    @{profileData.username}
                  </p>
                </div>
              </div>

              {/* Form Fields */}
              <div style={{
                display: 'grid',
                gap: 'var(--spacing-md)'
              }}>
                {/* School */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    School/University
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="school"
                      value={formData.school}
                      onChange={handleInputChange}
                      placeholder="Enter your school or university"
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <p style={{
                      margin: 0,
                      padding: 'var(--spacing-sm)',
                      backgroundColor: 'var(--background)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      minHeight: '20px'
                    }}>
                      {profileData.school || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Specialty */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    Specialty/Major
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="specialty"
                      value={formData.specialty}
                      onChange={handleInputChange}
                      placeholder="Enter your specialty or major"
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <p style={{
                      margin: 0,
                      padding: 'var(--spacing-sm)',
                      backgroundColor: 'var(--background)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      minHeight: '20px'
                    }}>
                      {profileData.specialty || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Year of Study */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    Year of Study
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="yearOfStudy"
                      value={formData.yearOfStudy}
                      onChange={handleInputChange}
                      placeholder="e.g., 2nd Year, Graduate, etc."
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <p style={{
                      margin: 0,
                      padding: 'var(--spacing-sm)',
                      backgroundColor: 'var(--background)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      minHeight: '20px'
                    }}>
                      {profileData.yearOfStudy || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    Email
                  </label>
                  {isEditing ? (
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      placeholder="Enter your email"
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <p style={{
                      margin: 0,
                      padding: 'var(--spacing-sm)',
                      backgroundColor: 'var(--background)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      minHeight: '20px'
                    }}>
                      {profileData.email || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Phone Number */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    Phone Number
                  </label>
                  {isEditing ? (
                    <input
                      type="tel"
                      name="phoneNumber"
                      value={formData.phoneNumber}
                      onChange={handleInputChange}
                      placeholder="Enter your phone number"
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <p style={{
                      margin: 0,
                      padding: 'var(--spacing-sm)',
                      backgroundColor: 'var(--background)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      minHeight: '20px'
                    }}>
                      {profileData.phoneNumber || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    City
                  </label>
                  {isEditing ? (
                    <input
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleInputChange}
                      placeholder="Enter your city"
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)'
                      }}
                    />
                  ) : (
                    <p style={{
                      margin: 0,
                      padding: 'var(--spacing-sm)',
                      backgroundColor: 'var(--background)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      minHeight: '20px'
                    }}>
                      {profileData.city || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Interests */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    Interests
                  </label>
                  {isEditing ? (
                    <textarea
                      name="interests"
                      value={formData.interests}
                      onChange={handleInputChange}
                      placeholder="Enter your interests and hobbies"
                      rows={3}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <p style={{
                      margin: 0,
                      padding: 'var(--spacing-sm)',
                      backgroundColor: 'var(--background)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      minHeight: '20px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {profileData.interests || 'Not specified'}
                    </p>
                  )}
                </div>

                {/* Bio */}
                <div>
                  <label style={{
                    display: 'block',
                    marginBottom: 'var(--spacing-xs)',
                    fontSize: '0.875rem',
                    fontWeight: 500,
                    color: 'var(--text-primary)'
                  }}>
                    Bio
                  </label>
                  {isEditing ? (
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about yourself"
                      rows={4}
                      style={{
                        width: '100%',
                        padding: 'var(--spacing-sm)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--radius-sm)',
                        fontSize: '0.875rem',
                        backgroundColor: 'var(--background)',
                        color: 'var(--text-primary)',
                        resize: 'vertical'
                      }}
                    />
                  ) : (
                    <p style={{
                      margin: 0,
                      padding: 'var(--spacing-sm)',
                      backgroundColor: 'var(--background)',
                      borderRadius: 'var(--radius-sm)',
                      color: 'var(--text-primary)',
                      fontSize: '0.875rem',
                      minHeight: '20px',
                      whiteSpace: 'pre-wrap'
                    }}>
                      {profileData.bio || 'Not specified'}
                    </p>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div style={{
              textAlign: 'center',
              padding: 'var(--spacing-xl)',
              color: 'var(--text-secondary)'
            }}>
              Failed to load profile data
            </div>
          )}
        </div>

        {/* Footer */}
        <div style={{
          padding: 'var(--spacing-lg)',
          borderTop: '1px solid var(--border)',
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 'var(--spacing-sm)'
        }}>
          {isEditing ? (
            <>
              <button
                onClick={handleCancel}
                disabled={isSaving}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: 'transparent',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-sm)',
                  color: 'var(--text-primary)',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={isSaving}
                style={{
                  padding: 'var(--spacing-sm) var(--spacing-md)',
                  backgroundColor: isSaving ? 'var(--border)' : 'var(--primary)',
                  border: 'none',
                  borderRadius: 'var(--radius-sm)',
                  color: 'white',
                  cursor: isSaving ? 'not-allowed' : 'pointer',
                  fontSize: '0.875rem',
                  fontWeight: 500,
                  opacity: isSaving ? 0.6 : 1
                }}
              >
                {isSaving ? 'Saving...' : 'Save Changes'}
              </button>
            </>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: 'var(--spacing-sm) var(--spacing-md)',
                backgroundColor: 'var(--primary)',
                border: 'none',
                borderRadius: 'var(--radius-sm)',
                color: 'white',
                cursor: 'pointer',
                fontSize: '0.875rem',
                fontWeight: 500
              }}
            >
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfileModal;
