import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Provider } from 'react-redux';
import store from './redux/store';
import Login from './Login';
import ClockInOut from './ClockInOut';
import UserProfile from './UserProfile';
import AdminDashboard from './AdminDashboard';
import { logout } from './redux/reducers';
import './App.css';
import ReactDOM from 'react-dom/client';

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
          user.role === 'admin' ? (
            <AdminDashboard />
          ) : (
            <>
              <ClockInOut />
              <UserProfile user={user} />
            </>
          )
        ) : (
          <Login />
        )}
      </main>
    </div>
  );
}

export default App;

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <Provider store={store}>
    <App />
  </Provider>
);
