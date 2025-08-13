import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const Login = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');

  const onSubmit = async (data: any) => {
    try {
      const response = await axios.post('http://localhost:8080/authenticate', {
        username: data.username,
        password: data.password,
      });
      localStorage.setItem('token', response.data); // Store JWT token
      navigate('/dashboard');
    } catch (err: any) {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="main-content">
      <div className="auth-container">
        <div className="auth-header">
          <h1>Welcome Back!</h1>
          <p>Sign in to access your student wallet</p>
        </div>
        {error && (
          <div style={{ 
            backgroundColor: 'var(--danger)', 
            color: 'white', 
            padding: 'var(--spacing-md)',
            borderRadius: 'var(--radius-md)',
            marginBottom: 'var(--spacing-md)'
          }}>
            {error}
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit(onSubmit)}>
          <div className="form-group">
            <label className="form-label">Username</label>
            <input
              type="text"
              className="form-input"
              {...register('username')}
              required
              placeholder="Enter your username"
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              {...register('password')}
              required
              placeholder="Enter your password"
            />
          </div>
          <button type="submit" className="btn-primary">Sign In</button>
        </form>
        <div style={{ marginTop: 'var(--spacing-lg)', textAlign: 'center' }}>
          <p>Don't have an account? <Link to="/signup" className="nav-link">Sign Up</Link></p>
        </div>
      </div>
    </div>
  );
};

export default Login;
