import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';

const SignUp = () => {
  const { register, handleSubmit } = useForm();
  const navigate = useNavigate();
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');

  const onSubmit = async (data: any) => {
    try {
      await axios.post('http://localhost:8080/register/user', {
        name: data.name,
        username: data.username,
        password: data.password,
        role: 'USER', // Default role
      });

      setSuccess('Account created successfully! You can now log in.');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err: any) {
      setError('Registration failed. Please try again.');
    }
  };

  return (
    <div className="container-fluid d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', backgroundColor: '#f8f9fa' }}>
      <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
        <div className="card-body">
          <h3 className="card-title">Sign Up</h3>
          {error && <div className="alert alert-danger">{error}</div>}
          {success && <div className="alert alert-success">{success}</div>}
          <form onSubmit={handleSubmit(onSubmit)}>
            <div className="mb-3">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="form-control"
                {...register('name')}
                required
              />
            </div>
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
            <button type="submit" className="btn btn-success w-100">Sign Up</button>
          </form>
          <div className="mt-3 text-center">
            <p>Already have an account? <Link to="/login">Login</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SignUp;
