import React from 'react';


const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const ProfileHeader = ({ user, role, stats }) => {
  // Use user.initials if provided, else compute from name
  const initials = user.initials || getInitials(user.name);
  return (
    <div className="profile-header">
      <div className="profile-header-content">
        <div className="profile-avatar-large">{initials}</div>
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