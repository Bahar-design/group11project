import React, { useState } from 'react';
import ProfileHeader from './profileHeader.jsx';
import ProfileTabs from './profileTabs.jsx';
import PersonalInfo from './personalInfo.jsx';
import Settings from './volunteerNotifications.jsx';


const VolunteerProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('personal-info');

  if (!user) {
    return <div>Loading volunteer profile...</div>;
  }

  const stats = user?.stats || { familiesHelped: 0, hoursVolunteered: 0, averageRating: 0, eventsJoined: 0 };

  const tabs = [
    { id: 'personal-info', label: 'Personal Info' },
    { id: 'settings', label: 'Notifications' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal-info':
        return <PersonalInfo user={user} />;
      case 'settings':
        return <Settings user={user} />;
      default:
        return <PersonalInfo user={user} />;
    }
  };

  return (
    <div className="profile-container">
      <ProfileHeader 
        user={user}
        role="Dedicated Volunteer"
        stats={[
          { number: stats.familiesHelped ?? 0, label: 'Families Helped' },
          { number: stats.hoursVolunteered ?? 0, label: 'Hours Volunteered' },
          { number: stats.averageRating ?? 0, label: 'Average Rating' },
          { number: stats.eventsJoined ?? 0, label: 'Events Joined' }
        ]}
      />
      
      <ProfileTabs 
        tabs={tabs}
        activeTab={activeTab}
        onTabChange={setActiveTab}
      />
      
      <div className="profile-content active">
        {renderTabContent()}
      </div>
    </div>
  );
};

export default VolunteerProfile;