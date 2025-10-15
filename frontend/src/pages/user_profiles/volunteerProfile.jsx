import React, { useState } from 'react';
import ProfileHeader from './profileHeader.jsx';
import ProfileTabs from './profileTabs.jsx';
import PersonalInfo from './personalInfo.jsx';
import Settings from './settings.jsx';


const VolunteerProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('personal-info');

  if (!user || !user.stats) {
    return <div>Loading volunteer profile...</div>;
  }

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
          { number: user.stats.familiesHelped, label: 'Families Helped' },
          { number: user.stats.hoursVolunteered, label: 'Hours Volunteered' },
          { number: user.stats.averageRating, label: 'Average Rating' },
          { number: user.stats.eventsJoined, label: 'Events Joined' }
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