import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import mockUsers from './mockUsers';
import { login } from './redux/reducers';

const Login = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault();

    const user = mockUsers.find(u => u.username === username && u.password === password);

    if (user) {
      dispatch(login(user));
    } else {
      setError('Invalid username or password');
    }
  };

  return (
    <div className="login-container">
      <h2 className="welcome-text">Welcome to Clock-In-Out App</h2>
      <div className="login-box">
        <h3 className="login-subtitle">Please sign in to continue</h3>
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
    </div>
  );
};

export default Login;
