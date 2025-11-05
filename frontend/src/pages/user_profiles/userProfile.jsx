
import { useNavigate } from "react-router-dom";
import Layout from '../../components/layout.jsx';
import AdminProfile from './adminProfile.jsx';
import VolunteerProfile from './volunteerProfile.jsx';
import React, { useState } from 'react';
import { UserProfileContext } from './adminInfo';
import './userProfile.css';
import '../../../styling2/style.css';

const UserProfiles = ({ isLoggedIn, user, onLogout }) => {
  if (!user) return null;
  // Initialize profile from localStorage if available, otherwise use passed user
  let initialProfile = user || {};
  try {
    const saved = localStorage.getItem('hh_userProfile');
    if (saved) initialProfile = { ...initialProfile, ...JSON.parse(saved) };
  } catch (e) {
    // ignore parse errors
  }
  const [userProfile, setUserProfile] = useState(initialProfile);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
      <Layout 
        currentPage="profile" 
        isLoggedIn={isLoggedIn} 
        onLogout={onLogout}
        showHeader={true}
        user={user}
      >
        <div className="app" style={{ background: 'var(--silver)', minHeight: '100vh' }}>
          <div className="container">
            {/* Profile Component */}
            {user.userType === 'admin' ? (
              <AdminProfile user={userProfile} />
            ) : (
              <VolunteerProfile user={userProfile} />
            )}
          </div>
        </div>
      </Layout>
    </UserProfileContext.Provider>
  );
};

export default UserProfiles;