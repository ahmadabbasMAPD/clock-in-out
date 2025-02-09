// src/UserProfile.js

import React from 'react';

const UserProfile = ({ user }) => {
  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Contact No:</strong> {user.phone || 'Not available'}</p>
      <h3>Clock Entries:</h3>
      {user.clockEntries && user.clockEntries.map((entry, index) => (
        <div key={index}>
          <p>Date: {new Date(entry.date).toLocaleDateString()}</p>
          <p>Clock In: {entry.clockIn ? new Date(entry.clockIn).toLocaleTimeString() : 'N/A'}</p>
          <p>Clock Out: {entry.clockOut ? new Date(entry.clockOut).toLocaleTimeString() : 'N/A'}</p>
        </div>
      ))}
    </div>
  );
};

export default UserProfile;
