import React, { useState } from 'react';

const VolunteerHistory = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30-days');

  const activityData = [
    {
      title: 'Holiday Clothing Drive',
      date: 'Dec 23, 2025',
      location: 'Downtown Houston',
      rating: 5.0,
      impact: 'Helped 45 families',
      hours: '4 hours volunteered',
      role: 'Customer Service Lead',
      borderColor: 'var(--success)'
    },
    {
      title: 'Monday Madness Collection',
      date: 'Dec 16, 2025',
      location: 'Sugar Land',
      rating: 4.8,
      impact: 'Sorted 200+ items',
      hours: '4 hours volunteered',
      role: 'Organization Specialist',
      borderColor: 'var(--success)'
    },
    {
      title: 'Emergency Winter Response',
      date: 'Dec 10, 2025',
      location: 'Multiple Locations',
      rating: 5.0,
      impact: 'Emergency response',
      hours: '6 hours volunteered',
      role: 'Bilingual Support Coordinator',
      borderColor: 'var(--primary-red)'
    }
  ];

  const performanceMetrics = [
    { label: 'Attendance Rate', value: 98, color: 'var(--success)', description: '47/48 events attended' },
    { label: 'Average Rating', value: 98, color: 'var(--primary-red)', description: '4.9 stars from event coordinators' },
    { label: 'Response Time', value: null, color: 'var(--warning)', description: '2.1h average response time' }
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

  return (
    <div>
      <div className="profile-grid" style={{ gridColumn: '1 / -1' }}>
        <div className="profile-card" style={{ gridColumn: '1 / -1' }}>
          <div className="profile-card-header">
            <h3 className="profile-card-title">Performance Analytics</h3>
            <div style={{ display: 'flex', gap: '1rem' }}>
              <select 
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
                style={{ 
                  padding: '0.5rem', 
                  borderRadius: '8px', 
                  border: 'none', 
                  background: 'rgba(255,255,255,0.2)', 
                  color: 'white',
                  cursor: 'pointer'
                }}
              >
                <option>Last 30 Days</option>
                <option>Last 90 Days</option>
                <option>This Year</option>
                <option>All Time</option>
              </select>
            </div>
          </div>
          <div className="profile-card-content">
            <div className="chart-container">
              <div className="chart-placeholder">
                Volunteer Activity Chart - Hours per Month
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Recent Activity</h3>
            <button className="btn-secondary edit-btn" type="button">
            View All
            </button>
          </div>
          <div className="profile-card-content">
            <div className="activity-list">
              {activityData.map((activity, index) => (
                <div 
                  key={index}
                  className="activity-item" 
                  style={{ borderLeftColor: activity.borderColor }}
                >
                  <div className="activity-header">
                    <div>
                      <div className="activity-title">{activity.title}</div>
                      <div className="activity-date">{activity.date} • {activity.location}</div>
                    </div>
                    <div className="activity-badge">
                      ⭐ {activity.rating}
                    </div>
                  </div>
                  <div className="activity-details">
                    <strong>Impact:</strong> {activity.impact} • {activity.hours}<br/>
                    <strong>Role:</strong> {activity.role}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Performance Metrics</h3>
          </div>
          <div className="profile-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {performanceMetrics.map((metric, index) => (
                <div key={index} style={{ background: 'var(--silver)', padding: '1.5rem', borderRadius: '12px' }}>
                  <div style={{ 
                    display: 'flex', 
                    justifyContent: 'space-between', 
                    alignItems: 'center', 
                    marginBottom: '1rem' 
                  }}>
                    <span style={{ fontWeight: 600 }}>{metric.label}</span>
                    <span style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 700, 
                      color: metric.color 
                    }}>
                      {metric.value ? `${metric.value}%` : metric.description.split(' ')[0]}
                    </span>
                  </div>
                  {metric.value && (
                    <div style={{ 
                      background: 'var(--medium-silver)', 
                      height: '8px', 
                      borderRadius: '4px', 
                      overflow: 'hidden',
                      marginBottom: '0.5rem'
                    }}>
                      <div style={{ 
                        background: metric.color, 
                        height: '100%', 
                        width: `${metric.value}%`, 
                        borderRadius: '4px' 
                      }}></div>
                    </div>
                  )}
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-secondary)' 
                  }}>
                    {metric.description}
                  </div>
                </div>
              ))}

              <div style={{ 
                background: 'var(--warm-red)', 
                padding: '1.5rem', 
                borderRadius: '12px', 
                textAlign: 'center' 
              }}>
                <div style={{ 
                  fontWeight: 600, 
                  color: 'var(--text-primary)', 
                  marginBottom: '0.5rem' 
                }}>
                Top 5% Volunteer
                </div>
                <div style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)' 
                }}>
                Based on impact, reliability, and community feedback
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card" style={{ gridColumn: '1 / -1' }}>
          <div className="profile-card-header">
            <h3 className="profile-card-title">Additional Tools</h3>
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
                  <button className="btn-secondary" style={{ width: '100%' }}>
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

export default VolunteerHistory;