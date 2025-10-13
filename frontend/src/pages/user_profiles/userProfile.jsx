import React from "react";
import { useNavigate } from "react-router-dom";
import Layout from '../../components/layout.jsx';
import AdminProfile from './adminProfile.jsx';
import VolunteerProfile from './volunteerProfile.jsx';
import './userProfile.css';
import '../../../styling2/style.css';

const UserProfiles = ({ user, onLogout }) => {
  if (!user) return null;
  return (
    <Layout 
      currentPage="profile" 
      isLoggedIn={true} 
      onLogout={onLogout}
      showHeader={true}
    >
      <div className="app" style={{ background: 'var(--silver)', minHeight: '100vh' }}>
        <div className="container">
          {/* Profile Component */}
          {user.userType === 'admin' ? (
            <AdminProfile user={user} />
          ) : (
            <VolunteerProfile user={user} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfiles;