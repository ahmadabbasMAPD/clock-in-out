// src/UserProfile.js

import React from 'react';

const UserProfile = ({ user }) => {
  return (
    <div className="user-profile">
      <h2>User Profile</h2>
      <p><strong>Username:</strong> {user.username}</p>
      <p><strong>Contact No:</strong> {user.phone || 'Not available'}</p>
    </div>
  );
};

export default UserProfile;