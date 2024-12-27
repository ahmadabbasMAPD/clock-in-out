import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ClockInOut from './ClockInOut';
import Login from './Login';
import { logout } from './redux/reducers';
import './App.css';

function App() {
  const user = useSelector((state) => state.user.user); // Access the user state
  const dispatch = useDispatch();

  const handleLogout = () => {
    dispatch(logout()); // Dispatch the logout action
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Clock In and Out App</h1>
        {user ? (
          <div>
            <h2>Welcome, {user.username}!</h2>
            <button onClick={handleLogout}>Logout</button>
            <ClockInOut />
          </div>
        ) : (
          <Login /> // Show the Login component if not authenticated
        )}
      </header>
    </div>
  );
}

export default App;