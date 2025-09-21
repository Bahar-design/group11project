import React, { useState } from 'react';

const ManagementTools = ({ user }) => {
  const [loading, setLoading] = useState({});

  const quickActions = [
    { id: 'create-event', label: 'Create New Event', icon: '📅' },
    { id: 'send-alert', label: 'Send Volunteer Alert', icon: '📱' },
    { id: 'generate-report', label: 'Generate Report', icon: '📊' },
    { id: 'manage-volunteers', label: 'Manage Volunteers', icon: '👥' },
    { id: 'weather-alerts', label: 'Check Weather Alerts', icon: '🌤️' },
    { id: 'view-analytics', label: 'View Performance Analytics', icon: '📈' }
  ];

  const recentActivities = [
    {
      title: 'Created Holiday Drive Event',
      time: '2 hours ago',
      badge: { text: 'NEW', color: 'var(--primary-red)', bg: 'var(--warm-red)' },
      action: 'Event created for Dec 23, Downtown Houston',
      status: '6/12 volunteers signed up',
      borderColor: 'var(--primary-red)'
    },
    {
      title: 'Sent Emergency Weather Alert',
      time: '1 day ago',
      badge: { text: 'ALERT', color: 'var(--warning)', bg: '#fffbeb' },
      action: 'Notified 45 volunteers about weather delay',
      status: 'Event rescheduled successfully',
      borderColor: 'var(--warning)'
    },
    {
      title: 'Approved New Volunteer',
      time: '3 days ago',
      badge: { text: '✓ DONE', color: 'var(--success)', bg: '#f0fdf4' },
      action: 'Background check completed for James Miller',
      status: 'Skills: Customer Service, Leadership',
      borderColor: 'var(--success)'
    }
  ];

  const managementTools = [
    {
      icon: '📊',
      title: 'Volunteer Management',
      description: 'View performance metrics, approve new volunteers, and manage team assignments.',
      buttonText: 'Access Dashboard'
    },
    {
      icon: '🌤️',
      title: 'Weather Integration',
      description: 'Monitor weather conditions and set up automatic alerts for event cancellations.',
      buttonText: 'Weather Dashboard'
    },
    {
      icon: '📱',
      title: 'Communication Hub',
      description: 'Send targeted notifications, emergency alerts, and volunteer updates.',
      buttonText: 'Message Center'
    },
    {
      icon: '📈',
      title: 'Impact Analytics',
      description: 'Generate detailed reports on community impact and volunteer performance.',
      buttonText: 'Analytics Suite'
    }
  ];

  const handleQuickAction = async (actionId) => {
    setLoading(prev => ({ ...prev, [actionId]: true }));
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    setLoading(prev => ({ ...prev, [actionId]: false }));
    console.log('Quick action executed:', actionId);
  };

  const handleToolAccess = (toolTitle) => {
    console.log('Accessing tool:', toolTitle);
    // navigate to the specific tool or open a modal
  };

  return (
    <div>
      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Quick Actions</h3>
          </div>
          <div className="profile-card-content">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {quickActions.map((action) => (
                <button
                  key={action.id}
                  className={action.id.includes('create') || action.id.includes('send') ? 'btn-primary' : 'btn-secondary'}
                  style={{ 
                    justifyContent: 'center',
                    opacity: loading[action.id] ? 0.7 : 1,
                    cursor: loading[action.id] ? 'not-allowed' : 'pointer'
                  }}
                  onClick={() => handleQuickAction(action.id)}
                  disabled={loading[action.id]}
                >
                  {loading[action.id] ? (
                    <>
                      <div className="loading"></div>
                      Processing...
                    </>
                  ) : (
                    <>
                      {action.icon} {action.label}
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Recent Management Activity</h3>
          </div>
          <div className="profile-card-content">
            <div className="activity-list">
              {recentActivities.map((activity, index) => (
                <div 
                  key={index}
                  className="activity-item" 
                  style={{ borderLeftColor: activity.borderColor }}
                >
                  <div className="activity-header">
                    <div>
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-date">{activity.time}</div>
                    </div>
                    <div 
                      className="activity-badge" 
                      style={{ 
                        background: activity.badge.bg, 
                        color: activity.badge.color 
                      }}
                    >
                      {activity.badge.text}
                    </div>
                  </div>
                  <div className="activity-details">
                    <strong>Action:</strong> {activity.action}<br/>
                    <strong>Status:</strong> {activity.status}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '2rem' }}>
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Administrative Tools</h3>
          </div>
          <div className="profile-card-content">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {managementTools.map((tool, index) => (
                <div key={index} style={{ 
                  background: 'var(--silver)', 
                  padding: '1.5rem', 
                  borderRadius: '12px' 
                }}>
                  <h4 style={{ 
                    marginBottom: '1rem', 
                    color: 'var(--text-primary)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem' 
                  }}>
                    {tool.icon} {tool.title}
                  </h4>
                  <p style={{ 
                    color: 'var(--text-secondary)', 
                    marginBottom: '1rem', 
                    fontSize: '0.9rem' 
                  }}>
                    {tool.description}
                  </p>
                  <button 
                    className="btn-secondary" 
                    style={{ width: '100%' }}
                    onClick={() => handleToolAccess(tool.title)}
                  >
                    {tool.buttonText}
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagementTools;