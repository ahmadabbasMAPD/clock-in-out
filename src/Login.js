// src/Login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from './api'; // Using centralized Axios instance

const Login = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      // Use api.post to use the base URL defined in api.js
      const response = await api.post('/api/auth/login', { username, password });
      const user = response.data;
      console.log('Login successful:', user);
      onLogin(user);
      navigate('/');
    } catch (err) {
      console.error('Login failed:', err);
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <h2 className="welcome-text">Welcome to Clock-In-Out App!!!</h2>
      <form onSubmit={handleLogin} className="login-form">
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
          className="login-input"
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          className="login-input"
        />
        <button type="submit" className="login-button">Log In</button>
        {error && <p className="login-error">{error}</p>}
      </form>
    </div>
  );
};

export default Login;
