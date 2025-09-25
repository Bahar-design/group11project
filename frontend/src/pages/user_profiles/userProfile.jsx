import React, { useState } from 'react';
import Layout from '../../components/layout.jsx';
import VolunteerProfile from './volunteerProfile.jsx';
import AdminProfile from './adminProfile.jsx';
import './userProfile.css';
import '../../../styling2/style.css';

const UserProfiles = () => {
  const [activeUserType, setActiveUserType] = useState('volunteer');
  
  const [user] = useState({
    volunteer: {
      name: 'Sarah Johnson',
      initials: 'SJ',
      email: 'sarah.j@email.com',
      phone: '713-555-0123',
      emergencyContact: 'Mike Johnson - 713-555-0124',
      stats: {
        familiesHelped: 127,
        hoursVolunteered: 52,
        averageRating: 4.9,
        eventsJoined: 15
      }
    },
    admin: {
      name: 'Maria Delgado',
      initials: 'MD',
      email: 'maria.d@houstonhearts.org',
      phone: '713-555-0100',
      stats: {
        eventsManaged: 47,
        volunteersCoordinated: 285,
        familiesImpacted: 1850,
        successRate: 98
      }
    }
  });

  const handleUserTypeChange = (userType) => {
    setActiveUserType(userType);
  };

  const handleLogout = () => {
    console.log('Logout clicked');
  };

  return (
    <Layout 
      currentPage="profile" 
      isLoggedIn={true} 
      onLogout={handleLogout}
      showHeader={false}
    >
      <div className="app">
        {/* Your original Navbar */}
        <nav className="navbar">
          <div className="nav-container">
            <div className="logo">
              <div className="logo-icon">🤝</div>
              <span>Houston Hearts</span>
            </div>
            <div className="nav-links">
              <a href="#dashboard">Dashboard</a>
              <a href="#events">Events</a>
              <a href="#profile" className="active">Profile</a>
              <a href="#impact">Impact</a>
            </div>
            <div className="user-menu">
              <div className="user-avatar" title="Profile Menu">
                {user[activeUserType].initials}
              </div>
              <button className="btn-logout" onClick={handleLogout}>
                Sign Out
              </button>
            </div>
          </div>
        </nav>
        
        <div className="container">
          {/* User Type Toggle */}
          <div className="user-type-toggle">
            <div className="toggle-container">
              <button 
                className={`toggle-btn ${activeUserType === 'volunteer' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('volunteer')}
              >
                👤 Volunteer Profile
              </button>
              <button 
                className={`toggle-btn ${activeUserType === 'admin' ? 'active' : ''}`}
                onClick={() => handleUserTypeChange('admin')}
              >
                ⚡ Admin Profile
              </button>
            </div>
          </div>

          {/* Profile Components */}
          {activeUserType === 'volunteer' ? (
            <VolunteerProfile user={user.volunteer} />
          ) : (
            <AdminProfile user={user.admin} />
          )}
        </div>
      </div>
    </Layout>
  );
};

export default UserProfiles;