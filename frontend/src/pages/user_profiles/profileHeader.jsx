import React from 'react';


const getInitials = (name) => {
  if (!name) return '';
  const parts = name.trim().split(' ');
  if (parts.length === 1) return parts[0][0]?.toUpperCase() || '';
  return (parts[0][0] + (parts[1]?.[0] || '')).toUpperCase();
};

const ProfileHeader = ({ user, role }) => {
  // Use user.initials if provided, else compute from name
  const initials = user.initials || getInitials(user.name);
  return (
    <div className="profile-header">
      <div className="profile-header-content">
        <div className="profile-avatar-large">{initials}</div>
        <h1 className="profile-name">{user?.name || ''}</h1>
        <p className="profile-role">{role}</p>
      </div>
    </div>
  );
};

export default ProfileHeader;