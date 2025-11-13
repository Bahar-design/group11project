import React, { useState } from 'react';
import ProfileHeader from './profileHeader.jsx';
import ProfileTabs from './profileTabs.jsx';
import AdminInfo from './adminInfo.jsx';

const AdminProfile = ({ user, isLoggedIn, onLogout }) => {
  const [activeTab, setActiveTab] = useState('admin-info');

  const tabs = [
    { id: 'admin-info', label: 'Admin Info' },
    { id: 'notifications', label: 'Notifications' },
  ];

  const AdminNotificationsTab = React.lazy(() => import('./adminNotificationsTab.jsx'));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'admin-info':
        return <AdminInfo user={user} isLoggedIn={isLoggedIn} onLogout={onLogout} />;
      case 'notifications':
        return (
          <React.Suspense fallback={<div>Loading...</div>}>
            <AdminNotificationsTab user={user} isLoggedIn={isLoggedIn} onLogout={onLogout} />
          </React.Suspense>
        );
      default:
        return <AdminInfo user={user} isLoggedIn={isLoggedIn} onLogout={onLogout} />;
    }
  };

  if (!user) return <div>Loading...</div>;

  const stats = user?.stats || { eventsManaged: 0, volunteersCoordinated: 0, familiesImpacted: 0, successRate: 0 };

  return (
    <div className="profile-container">
      <ProfileHeader 
        user={user}
        role="⚡ Regional Administrator"
        stats={[
          { number: stats.eventsManaged ?? 0, label: 'Events Managed' },
          { number: stats.volunteersCoordinated ?? 0, label: 'Volunteers Coordinated' },
          { number: stats.familiesImpacted ?? 0, label: 'Families Impacted' },
          { number: `${stats.successRate ?? 0}%`, label: 'Success Rate' }
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
