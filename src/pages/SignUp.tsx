import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState<{ [key: string]: string }>({});
  const [success, setSuccess] = useState<string>('');

  const onSubmit = async (data: any) => {
    const formData = new FormData();
    formData.append("user", new Blob([JSON.stringify({
      name: data.name,
      username: data.username,
      password: data.password,
      role: 'USER'
    })], { type: "application/json" }));
    
    if (data.file?.[0]) {
      formData.append("file", data.file[0]);
    }

    try {
      await axios.post('http://localhost:8080/register/user', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setSuccess('Account created successfully! You can now log in.');
      setError({});
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      if (err.response && err.response.status === 400) {
        setError(err.response.data); // Store validation errors from backend
      } else {
        setError({ general: "Registration failed. Please try again." });
      }
    }
  };

  return (
    <div className="main-content">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Create Account</h1>
          <p>Join our student community</p>
        </div>
        
        {error.general && (
          <div style={{ 
            backgroundColor: 'var(--danger)', 
            color: 'white', 
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-md)'
          }}>
            {error.general}
          </div>
        )}
        {success && (
          <div style={{ 
            backgroundColor: 'var(--success)', 
            color: 'white', 
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-md)'
          }}>
            {success}
          </div>
        )}
        
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)} encType="multipart/form-data">
          {/* Full Name Field */}
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input 
              type="text" 
              className="form-input" 
              {...register('name')} 
              required 
              placeholder="Enter your full name"
            />
            {error.name && (
              <p style={{ 
                color: 'var(--danger)', 
                marginTop: 'var(--spacing-xs)',
                fontSize: '0.875rem'
              }}>
                {error.name}
              </p>
            )}
          </div>

          {/* Username Field */}
          <div className="form-group">
            <label className="form-label">Username</label>
            <input 
              type="text" 
              className="form-input" 
              {...register('username')} 
              required 
              placeholder="Choose a username"
            />
            {error.username && (
              <p style={{ 
                color: 'var(--danger)', 
                marginTop: 'var(--spacing-xs)',
                fontSize: '0.875rem'
              }}>
                {error.username}
              </p>
            )}
          </div>

          {/* Password Field */}
          <div className="form-group">
            <label className="form-label">Password</label>
            <input 
              type="password" 
              className="form-input" 
              {...register('password')} 
              required 
              placeholder="Create a password"
            />
          </div>

          {/* Profile Picture Field */}
          <div className="form-group">
            <label className="form-label">Profile Picture</label>
            <input 
              type="file" 
              className="form-input" 
              {...register('file')} 
              accept="image/*" 
            />
          </div>

          <button type="submit" className="btn-primary">Create Account</button>
        </form>

        <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
          <p>Already have an account? <Link to="/login" className="nav-link">Sign In</Link></p>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
