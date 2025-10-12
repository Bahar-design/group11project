import React, { useState } from 'react';
import ProfileHeader from './profileHeader.jsx';
import ProfileTabs from './profileTabs.jsx';
import PersonalInfo from './personalInfo.jsx';
import SkillsAvailability from './skillsAvailability.jsx';
import VolunteerHistory from './volunteerHistory.jsx';
import Settings from './settings.jsx';

const VolunteerProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('personal-info');

  const tabs = [
    { id: 'personal-info', label: 'Personal Info' },
    { id: 'skills-availability', label: 'Skills & Availability' },
    { id: 'volunteer-history', label: 'Volunteer History' },
    { id: 'settings', label: 'Notifications' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'personal-info':
        return <PersonalInfo user={user} />;
      case 'skills-availability':
        return <SkillsAvailability user={user} />;
      case 'volunteer-history':
        return <VolunteerHistory user={user} />;
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