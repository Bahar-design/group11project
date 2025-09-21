import React, { useState } from 'react';

const Analytics = ({ user }) => {
  const [selectedPeriod, setSelectedPeriod] = useState('30-days');

  const kpiMetrics = [
    { 
      label: 'Event Success Rate', 
      value: 98, 
      color: 'var(--success)', 
      description: '47/48 events completed successfully' 
    },
    { 
      label: 'Volunteer Retention', 
      value: 87, 
      color: 'var(--primary-red)', 
      description: '74/85 volunteers active this quarter' 
    },
    { 
      label: 'Response Time', 
      value: null, 
      color: 'var(--warning)', 
      description: '1.8h average time to fill volunteer positions',
      displayValue: '1.8h'
    }
  ];

  const growthMetrics = [
    { label: 'New Volunteers', value: 12, growth: 20, color: 'var(--success)' },
    { label: 'Events Created', value: 8, growth: 14, color: 'var(--success)' },
    { label: 'Families Helped', value: 342, growth: 25, color: 'var(--success)' },
    { label: 'Items Processed', value: 1847, growth: 18, color: 'var(--success)' }
  ];

  const regionalData = [
    { name: 'Sugar Land', icon: '🏢', families: 147 },
    { name: 'Katy', icon: '🌳', families: 92 },
    { name: 'SW Houston', icon: '🌆', families: 103 }
  ];

  const handlePeriodChange = (period) => {
    setSelectedPeriod(period);
    console.log('Analytics period changed to:', period);
    // fetch new data based on the selected period
  };

  const handleExportData = () => {
    console.log('Exporting analytics data');
    // trigger data export
  };

  return (
    <div>
      <div className="profile-card" style={{ marginBottom: '2rem' }}>
        <div className="profile-card-header">
          <h3 className="profile-card-title">Regional Performance Overview</h3>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <select 
              value={selectedPeriod}
              onChange={(e) => handlePeriodChange(e.target.value)}
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
              <option>This Quarter</option>
              <option>This Year</option>
            </select>
            <button 
              className="btn-secondary" 
              style={{ color: 'white', border: 'none', padding: '0.5rem 1rem' }}
              onClick={handleExportData}
            >
              Export Data
            </button>
          </div>
        </div>
        <div className="profile-card-content">
          <div className="chart-container">
            <div className="chart-placeholder">
              Regional Impact Chart - Families Helped Over Time
            </div>
          </div>
        </div>
      </div>

      <div className="profile-grid">
        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Key Performance Indicators</h3>
          </div>
          <div className="profile-card-content">
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {kpiMetrics.map((metric, index) => (
                <div key={index} style={{ 
                  background: 'var(--silver)', 
                  padding: '1.5rem', 
                  borderRadius: '12px' 
                }}>
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
                      {metric.displayValue || (metric.value ? `${metric.value}%` : metric.description.split(' ')[0])}
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
                    fontSize: '0.8rem', 
                    color: 'var(--text-light)' 
                  }}>
                    {metric.description}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="profile-card">
          <div className="profile-card-header">
            <h3 className="profile-card-title">Growth Metrics</h3>
          </div>
          <div className="profile-card-content">
            <div style={{ display: 'grid', gap: '1rem' }}>
              {growthMetrics.map((metric, index) => (
                <div key={index} style={{ 
                  background: 'var(--warm-red)', 
                  padding: '1rem', 
                  borderRadius: '8px', 
                  display: 'flex', 
                  justifyContent: 'space-between' 
                }}>
                  <div>
                    <div style={{ 
                      fontSize: '0.9rem', 
                      color: 'var(--text-secondary)' 
                    }}>
                      {metric.label}
                    </div>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: 700, 
                      color: 'var(--text-primary)' 
                    }}>
                      {metric.value.toLocaleString()}
                    </div>
                  </div>
                  <div style={{ 
                    color: metric.color, 
                    fontWeight: 600 
                  }}>
                    +{metric.growth}%
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
            <h3 className="profile-card-title">Regional Breakdown</h3>
          </div>
          <div className="profile-card-content">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', 
              gap: '1.5rem' 
            }}>
              {regionalData.map((region, index) => (
                <div key={index} style={{ 
                  background: 'var(--silver)', 
                  padding: '1.5rem', 
                  borderRadius: '12px', 
                  textAlign: 'center' 
                }}>
                  <div style={{ 
                    fontSize: '1.5rem', 
                    marginBottom: '0.5rem' 
                  }}>
                    {region.icon}
                  </div>
                  <div style={{ 
                    fontWeight: 600, 
                    color: 'var(--text-primary)', 
                    marginBottom: '0.5rem' 
                  }}>
                    {region.name}
                  </div>
                  <div style={{ 
                    fontSize: '1.25rem', 
                    fontWeight: 700, 
                    color: 'var(--primary-red)', 
                    marginBottom: '0.5rem' 
                  }}>
                    {region.families}
                  </div>
                  <div style={{ 
                    fontSize: '0.9rem', 
                    color: 'var(--text-secondary)' 
                  }}>
                    families helped
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
            <h3 className="profile-card-title">Quick Insights</h3>
          </div>
          <div className="profile-card-content">
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', 
              gap: '1.5rem' 
            }}>
              <div style={{ 
                background: 'var(--warm-bg)', 
                padding: '1.5rem', 
                borderRadius: '12px',
                border: '1px solid var(--light-red)'
              }}>
                <h4 style={{ 
                  color: 'var(--primary-red)', 
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  Performance Alert
                </h4>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)' 
                }}>
                  Volunteer retention is down 3% from last quarter. Consider implementing 
                  additional recognition programs.
                </p>
              </div>

              <div style={{ 
                background: 'var(--warm-bg)', 
                padding: '1.5rem', 
                borderRadius: '12px',
                border: '1px solid var(--light-red)'
              }}>
                <h4 style={{ 
                  color: 'var(--primary-red)', 
                  marginBottom: '0.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}>
                  Recommendation
                </h4>
                <p style={{ 
                  fontSize: '0.9rem', 
                  color: 'var(--text-secondary)' 
                }}>
                  Consider expanding operations to Cypress area based on high demand 
                  and volunteer availability.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Analytics;