import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ClockInOut from './ClockInOut';
import Login from './Login';
import { logout } from './redux/reducers';
import './App.css';

function App() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout());
  };

  return (
    <div className="app-container">
      <header className="app-header">
        <h1 className="app-title">Clock In and Out App</h1>
        {user ? (
          <div className="user-info">
            <p>Welcome, {user.username}!</p>
            <button onClick={handleLogout} className="logout-button">Logout</button>
          </div>
        ) : null}
      </header>

      <main className="app-main">
        {user ? (
          <ClockInOut />
        ) : (
          <Login />
        )}
      </main>
    </div>
  );
}

export default App;
