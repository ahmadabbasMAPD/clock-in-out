// src/AdminDashboard.js

import React from 'react';

const AdminDashboard = () => {
  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>
      <p>Welcome, Admin!</p>
      <ul>
        <li>Manage Users</li>
        <li>View All Time Entries</li>
        <li>Generate Reports</li>
        <li>System Settings</li>
      </ul>
    </div>
  );
};

export default AdminDashboard;