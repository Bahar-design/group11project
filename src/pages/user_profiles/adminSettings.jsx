import React, { useState } from 'react';

const AdminSettings = ({ user }) => {
  const [permissions, setPermissions] = useState({
    createEvents: true,
    sendAlerts: true,
    accessData: true,
    approveAdmins: false
  });

  const [notifications, setNotifications] = useState({
    capacityAlerts: true,
    performanceAlerts: true,
    weatherAlerts: true,
    systemErrors: true,
    weeklyReports: true
  });

  const [securitySettings, setSecuritySettings] = useState({
    twoFactorEnabled: true,
    auditLogging: true,
    trackDataAccess: true,
    trackEventModifications: true,
    monitorEmergencyAlerts: true
  });

  const regions = [
    { id: 'sugar-land', name: 'Sugar Land Region', enabled: true },
    { id: 'katy', name: 'Katy Region', enabled: true },
    { id: 'sw-houston', name: 'Southwest Houston', enabled: true },
    { id: 'downtown', name: 'Downtown Houston', enabled: false }
  ];

  const handlePermissionToggle = (key) => {
    setPermissions(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleNotificationToggle = (key) => {
    setNotifications(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSecurityToggle = (key) => {
    setSecuritySettings(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  const handleSaveSettings = () => {
    const settingsData = {
      permissions,
      notifications,
      securitySettings,
      adminId: user.id
    };
    console.log('Saving admin settings:', settingsData);
  };

  const handleReconfigure2FA = () => {
    console.log('Reconfiguring 2FA');
  };

  const handleViewActivityLog = () => {
    console.log('Opening activity log');
  };

  const handleChangePassword = () => {
    console.log('Opening password change dialog');
  };

  const handleExportLogs = () => {
    console.log('Exporting admin logs');
  };

  const notificationOptions = [
    {
      key: 'capacityAlerts',
      title: 'Event Capacity Alerts',
      description: 'Get notified when events almost reach full capacity',
      active: notifications.capacityAlerts
    },
    {
      key: 'performanceAlerts',
      title: 'Volunteer Performance Alerts',
      description: 'Notifications for volunteers with concerning performance metrics',
      active: notifications.performanceAlerts
    },
    {
      key: 'weatherAlerts',
      title: 'Weather Emergency Alerts',
      description: 'Automatic alerts for severe weather affecting scheduled events',
      active: notifications.weatherAlerts
    },
    {
      key: 'systemErrors',
      title: 'System Error Notifications',
      description: 'Technical issues requiring administrative attention',
      active: notifications.systemErrors
    },
    {
      key: 'weeklyReports',
      title: 'Weekly Admin Reports',
      description: 'Comprehensive weekly performance and impact summaries',
      active: notifications.weeklyReports
    }
  ];

  return (
    <div>
      <div className="settings-card">
        <div className="settings-card-header">
          <h3 className="settings-card-title">Administrative Permissions</h3>
          <p className="settings-card-subtitle">
            Manage your administrative access levels and regional responsibilities
          </p>
        </div>
        <div className="settings-card-content">
          <div className="form-group">
            <label>Administrative Level</label>
            <select className="form-input" disabled style={{ opacity: 0.7 }}>
              <option>Regional Administrator</option>
              <option>Site Administrator</option>
              <option>Super Administrator</option>
            </select>
            <div style={{ 
              fontSize: '0.85rem', 
              color: 'var(--text-light)', 
              marginTop: '0.5rem' 
            }}>
              Contact Super Administrator to modify permission levels
            </div>
          </div>

          <div className="form-group">
            <label>Regional Access</label>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(2, 1fr)', 
              gap: '0.75rem', 
              marginTop: '0.5rem' 
            }}>
              {regions.map((region) => (
                <label key={region.id} style={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: '0.75rem' 
                }}>
                  <input
                    type="checkbox"
                    className="skill-checkbox"
                    checked={region.enabled}
                    disabled
                    style={{ opacity: 0.7 }}
                  />
                  <span style={{ opacity: region.enabled ? 1 : 0.7 }}>
                    {region.name}
                  </span>
                </label>
              ))}
            </div>
          </div>

          <div className="form-group">
            <label>Special Permissions</label>
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
                  checked={permissions.createEvents}
                  onChange={() => handlePermissionToggle('createEvents')}
                />
                <span>Create and manage events</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  className="skill-checkbox"
                  checked={permissions.sendAlerts}
                  onChange={() => handlePermissionToggle('sendAlerts')}
                />
                <span>Send emergency alerts</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  className="skill-checkbox"
                  checked={permissions.accessData}
                  onChange={() => handlePermissionToggle('accessData')}
                />
                <span>Access volunteer performance data</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  className="skill-checkbox"
                  checked={permissions.approveAdmins}
                  onChange={() => handlePermissionToggle('approveAdmins')}
                />
                <span>Approve new administrator accounts</span>
              </label>
            </div>
          </div>
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <h3 className="settings-card-title">Alert & Notification Settings</h3>
          <p className="settings-card-subtitle">
            Configure how you receive important administrative updates
          </p>
        </div>
        <div className="settings-card-content">
          {notificationOptions.map((option) => (
            <div key={option.key} className="notification-item">
              <div>
                <div style={{ fontWeight: 600, marginBottom: '0.25rem' }}>
                  {option.title}
                </div>
                <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  {option.description}
                </div>
              </div>
              <div 
                className={`notification-toggle ${option.active ? 'active' : ''}`}
                onClick={() => handleNotificationToggle(option.key)}
              ></div>
            </div>
          ))}
        </div>
      </div>

      <div className="settings-card">
        <div className="settings-card-header">
          <h3 className="settings-card-title">Security & Access</h3>
          <p className="settings-card-subtitle">
            Administrative account security and audit settings
          </p>
        </div>
        <div className="settings-card-content">
          <div className="form-group">
            <label>Two-Factor Authentication</label>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '1rem', 
              marginTop: '0.5rem' 
            }}>
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '0.5rem', 
                padding: '0.75rem', 
                background: 'var(--success)', 
                color: 'white', 
                borderRadius: '8px' 
              }}>
                ✓ Enabled
              </div>
              <button className="btn-secondary" onClick={handleReconfigure2FA}>
                Reconfigure
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Login Activity Monitoring</label>
            <div style={{ 
              background: 'var(--silver)', 
              padding: '1rem', 
              borderRadius: '8px', 
              marginTop: '0.5rem' 
            }}>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Last Login:</strong> Today at 8:24 AM from Houston, TX
              </div>
              <div style={{ fontSize: '0.9rem', marginBottom: '0.5rem' }}>
                <strong>Previous Login:</strong> Yesterday at 6:45 PM from Houston, TX
              </div>
              <button 
                className="btn-secondary" 
                style={{ fontSize: '0.85rem', padding: '0.5rem 1rem' }}
                onClick={handleViewActivityLog}
              >
                View Full Activity Log
              </button>
            </div>
          </div>

          <div className="form-group">
            <label>Data Access Audit</label>
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
                  checked={securitySettings.auditLogging}
                  onChange={() => handleSecurityToggle('auditLogging')}
                />
                <span>Log all volunteer data access</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  className="skill-checkbox"
                  checked={securitySettings.trackEventModifications}
                  onChange={() => handleSecurityToggle('trackEventModifications')}
                />
                <span>Track event modification history</span>
              </label>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <input
                  type="checkbox"
                  className="skill-checkbox"
                  checked={securitySettings.monitorEmergencyAlerts}
                  onChange={() => handleSecurityToggle('monitorEmergencyAlerts')}
                />
                <span>Monitor emergency alert usage</span>
              </label>
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
          Save Administrative Settings
        </button>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button className="btn-secondary" onClick={handleChangePassword}>
            Change Password
          </button>
          <button className="btn-secondary" onClick={handleExportLogs}>
            Export Admin Logs
          </button>
        </div>
      </div>
    </div>
  );
};

export default AdminSettings;