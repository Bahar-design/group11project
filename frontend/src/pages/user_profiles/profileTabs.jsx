import React from 'react';

const ProfileTabs = ({ tabs, activeTab, onTabChange }) => {
  return (
    <div className="profile-tabs">
      {tabs.map((tab) => (
        <button 
          key={tab.id}
          className={`profile-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
};

export default ProfileTabs;