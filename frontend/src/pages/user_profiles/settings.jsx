import React, { useState } from 'react';

const Settings = ({ user }) => {
  const [notifications, setNotifications] = useState({
    newEvents: true,
    emergencyAlerts: true,
    eventReminders: true,
    smsNotifications: false,
    weeklyReport: true
  });

  const [privacy, setPrivacy] = useState({
    profileVisibility: 'public',
    shareMetrics: true,
    includeInStories: true,
    shareContact: false
  });

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handlePrivacyChange = (key, value) => {
    setPrivacy(prev => ({
      ...prev,
      [key]: value
    }));
  };

  const handleSaveSettings = () => {
    const settingsData = {
      notifications,
      privacy,
      userId: user.id
    };
    console.log('Saving settings:', settingsData);
    // make an API call to save settings
  };

  const handleChangePassword = () => {
    console.log('Opening change password dialog');
    // open a password change modal or redirect
  };

  const handleDownloadData = () => {
    console.log('Initiating data download');
    // trigger data export
  };

  const handleDeleteAccount = () => {
    const confirmed = window.confirm(
      'Are you sure you want to delete your account? This action cannot be undone.'
    );
    if (confirmed) {
      console.log('Account deletion requested');
      // handle account deletion
    }
  };

  const notificationSettings = [
    {
      key: 'newEvents',
      title: 'New Event Notifications',
      description: 'Get notified about new volunteer opportunities that match your skills',
      active: notifications.newEvents
    },
    {
      key: 'emergencyAlerts',
      title: 'Emergency Alerts',
      description: 'Receive urgent notifications during disaster response events',
      active: notifications.emergencyAlerts
    },
    {
      key: 'eventReminders',
      title: 'Event Reminders',
      description: 'Get reminded about upcoming events you\'ve signed up for',
      active: notifications.eventReminders
    },
    {
      key: 'smsNotifications',
      title: 'SMS Notifications',
      description: 'Receive text messages for high-priority events',
      active: notifications.smsNotifications
    },
    {
      key: 'weeklyReport',
      title: 'Weekly Impact Report',
      description: 'Weekly summary of your volunteer impact and community updates',
      active: notifications.weeklyReport
    }
  ];

  return (
    <div>
      <div className="settings-card">
        <div className="settings-card-header">
          <h3 className="settings-card-title">Notification Preferences</h3>
          <p className="settings-card-subtitle">
            Manage how and when you receive updates about volunteer opportunities
          </p>
        </div>
        <div className="settings-card-content">
          {notificationSettings.map((setting) => (
            <div key={setting.key} className="notification-item">
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {setting.title}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {setting.description}
                </div>
              </div>
              <div 
                className={`notification-toggle ${setting.active ? 'active' : ''}`}
                onClick={() => handleNotificationToggle(setting.key)}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <h3 className="settings-card-title">Privacy & Security</h3>
          <p className="settings-card-subtitle">
            Control your data sharing and account security settings
          </p>
        </div>
        <div className="settings-card-content">
          <div className="form-group">
            <label>Profile Visibility</label>
            <select 
              className="form-input"
              value={privacy.profileVisibility}
              onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
            >
              <option value="public">Public - Visible to all volunteers</option>
              <option value="private">Private - Only visible to administrators</option>
              <option value="team">Team Only - Visible to team members</option>
            </select>
          </div>

          <div className="form-group">
            <label>Data Sharing Preferences</label>
            <div style={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: '0.75rem', 
              marginTop: '0.5rem' 
            }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  className="skill-checkbox"
                  checked={privacy.shareMetrics}
                  onChange={(e) => handlePrivacyChange('shareMetrics', e.target.checked)}
                />
                <span>Share performance metrics with team leads</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  className="skill-checkbox"
                  checked={privacy.includeInStories}
                  onChange={(e) => handlePrivacyChange('includeInStories', e.target.checked)}
                />
                <span>Include me in community success stories</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  className="skill-checkbox"
                  checked={privacy.shareContact}
                  onChange={(e) => handlePrivacyChange('shareContact', e.target.checked)}
                />
                <span>Share contact info with other volunteers</span>
              </label>
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginTop: '2rem' }}>
            <button className="btn-primary" onClick={handleChangePassword}>
              Change Password
            </button>
            <button className="btn-secondary" onClick={handleDownloadData}>
              Download My Data
            </button>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <h3 className="settings-card-title">Account Summary</h3>
          <p className="settings-card-subtitle">
            Overview of your account activity and settings
          </p>
        </div>
        <div className="settings-card-content">
          <div style={{ 
            display: 'grid', 
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
            gap: '1rem' 
          }}>
            <div style={{ 
              background: 'var(--silver)', 
              padding: '1rem', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Account Created
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                June 15, 2023
              </div>
            </div>
            <div style={{ 
              background: 'var(--silver)', 
              padding: '1rem', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Last Login
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                Today, 8:24 AM
              </div>
            </div>
            <div style={{ 
              background: 'var(--silver)', 
              padding: '1rem', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Data Storage
              </div>
              <div style={{ fontSize: '1.1rem', fontWeight: 600 }}>
                2.4 MB
              </div>
            </div>
            <div style={{ 
              background: 'var(--silver)', 
              padding: '1rem', 
              borderRadius: '8px' 
            }}>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                Security Score
              </div>
              <div style={{ 
                fontSize: '1.1rem', 
                fontWeight: 600, 
                color: 'var(--success)' 
              }}>
                Excellent
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        display: 'flex', 
        justifyContent: 'space-between', 
        alignItems: 'center', 
        marginTop: '2rem' 
      }}>
        <button 
          className="btn-primary" 
          style={{ padding: '1rem 2rem' }}
          onClick={handleSaveSettings}
        >
          Save All Settings
        </button>
        <button 
          className="btn-secondary" 
          style={{ color: '#dc2626', borderColor: '#dc2626' }}
          onClick={handleDeleteAccount}
        >
          Delete Account
        </button>
      </div>
    </div>
  );
};

export default Settings;