import React from 'react';

const ProfileHeader = ({ user, role, stats }) => {
  return (
    <div className="profile-header">
      <div className="profile-header-content">
        <div className="profile-avatar-large">{user.initials}</div>
        <h1 className="profile-name">{user.name}</h1>
        <p className="profile-role">{role}</p>
        <div className="profile-stats">
          {stats.map((stat, index) => (
            <div key={index} className="profile-stat">
              <div className="profile-stat-number">{stat.number}</div>
              <div className="profile-stat-label">{stat.label}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProfileHeader;