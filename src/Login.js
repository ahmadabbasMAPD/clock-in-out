import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import mockUsers from './mockUsers'; // Ensure this path is correct
import { login } from './redux/reducers'; // Ensure this path is correct

const Login = () => {
  const dispatch = useDispatch();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = (e) => {
    e.preventDefault(); // Prevent the default form submission

    // Find the user in the mockUsers array
    const user = mockUsers.find(
      (u) => u.username === username && u.password === password
    );

    // Check if the user exists
    if (user) {
      dispatch(login(user)); // Dispatch the login action with the user info
    } else {
      setError('Invalid username or password'); // Set error message
    }
  };

  return (
    <div>
      <h2>Login</h2>
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <button type="submit">Login</button>
      </form>
      {error && <p style={{ color: 'red' }}>{error}</p>} {/* Display error message */}
    </div>
  );
};

export default Login;