import React, { useState } from 'react';
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
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <h3 className="card-title">Login</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Username</label>
              <input
                type="text"
                className="form-control"
                {...register('username')}
                required
              />
            </div>
            <div className="mb-3">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                {...register('password')}
                required
              />
            </div>
            <button type="submit" className="btn btn-primary w-100">Login</button>
          </form>
          <div className="mt-3 text-center">
            <p>Don't have an account? <Link to="/signup">Sign Up</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
