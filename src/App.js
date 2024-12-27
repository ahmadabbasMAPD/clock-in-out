import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import ClockInOut from './ClockInOut';
import Login from './Login';
import UserProfile from './UserProfile';
import { logout } from './redux/reducers';
import './App.css';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';


function App() {
  const user = useSelector((state) => state.user.user);
  const dispatch = useDispatch();
  const [activeTab, setActiveTab] = useState('clock');
  const [workHours, setWorkHours] = useState({});

  const handleLogout = () => {
    dispatch(logout());
  };

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  useEffect(() => {
    // Simulating fetching work hours data
    // In a real scenario, you'd fetch this from an API or database
    const simulateFetchWorkHours = async () => {
      await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network delay
      setWorkHours({
        Monday: 8,
        Tuesday: 7,
        Wednesday: 9,
        Thursday: 8,
        Friday: 7,
        Saturday: 0,
        Sunday: 0,
        WeekTotal: 39,
        BiweekTotal: 78
      });
    };

    simulateFetchWorkHours();
  }, []);

  const renderChart = () => {
    const data = Object.keys(workHours).map(day => ({
      name: day,
      hours: workHours[day]
    })).filter(item => item.name !== 'WeekTotal' && item.name !== 'BiweekTotal');

    return (
      <ResponsiveContainer width="100%" height={300}>
      <BarChart
        data={data}
        margin={{
          top: 5,
          right: 30,
          left: 20,
          bottom: 5,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Bar dataKey="hours" fill="#8884d8" />
      </BarChart>
    </ResponsiveContainer>
    );
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
          <>
            <nav className="tabs">
              <button 
                className={`tab ${activeTab === 'clock' ? 'active' : ''}`} 
                onClick={() => handleTabChange('clock')}
              >
                Clock In/Out
              </button>
              <button 
                className={`tab ${activeTab === 'profile' ? 'active' : ''}`} 
                onClick={() => handleTabChange('profile')}
              >
                User Profile
              </button>
              <button 
                className={`tab ${activeTab === 'chart' ? 'active' : ''}`} 
                onClick={() => handleTabChange('chart')}
              >
                Work Hours Chart
              </button>
            </nav>

            {activeTab === 'clock' ? (
              <ClockInOut />
            ) : activeTab === 'profile' ? (
              <UserProfile user={user} />
            ) : (
              <div className="work-hours-chart">
                <h2>Work Hours Biweekly Chart</h2>
                {renderChart()}
                <p>Total hours worked this week: {workHours.WeekTotal || 0}</p>
                <p>Total hours worked this biweek: {workHours.BiweekTotal || 0}</p>
              </div>
            )}
          </>
        ) : (
          <Login />
        )}
      </main>
    </div>
  );
}

export default App;
