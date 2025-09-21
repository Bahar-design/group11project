import React, { useState } from 'react';
import ProfileHeader from './profileHeader.jsx';
import ProfileTabs from './profileTabs.jsx';
import AdminInfo from './adminInfo.jsx';
import ManagementTools from './managementTools.jsx';
import Analytics from './analytics.jsx';
import AdminSettings from './adminSettings.jsx';

const AdminProfile = ({ user }) => {
  const [activeTab, setActiveTab] = useState('admin-info');

  const tabs = [
    { id: 'admin-info', label: 'Admin Info' },
    { id: 'management-tools', label: 'Management Tools' },
    { id: 'analytics', label: 'Analytics Dashboard' },
    { id: 'admin-settings', label: 'Admin Settings' }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'admin-info':
        return <AdminInfo user={user} />;
      case 'management-tools':
        return <ManagementTools user={user} />;
      case 'analytics':
        return <Analytics user={user} />;
      case 'admin-settings':
        return <AdminSettings user={user} />;
      default:
        return <AdminInfo user={user} />;
    }
  };

  return (
    <div className="profile-container">
      <ProfileHeader 
        user={user}
        role="⚡ Regional Administrator"
        stats={[
          { number: user.stats.eventsManaged, label: 'Events Managed' },
          { number: user.stats.volunteersCoordinated, label: 'Volunteers Coordinated' },
          { number: user.stats.familiesImpacted, label: 'Families Impacted' },
          { number: `${user.stats.successRate}%`, label: 'Success Rate' }
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

export default AdminProfile;