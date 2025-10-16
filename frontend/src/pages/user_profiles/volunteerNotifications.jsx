import React, { useState, useEffect } from 'react';

const Notification = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [expandedId, setExpandedId] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load notifications from backend
  useEffect(() => {
    const userId = user?.id || 1; // fallback to 1 if user not provided
    fetch(`http://localhost:4000/api/notifications/${userId}`)
      .then(res => res.json())
      .then(data => {
        setNotifications(data);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching notifications:', err);
        setLoading(false);
      });
  }, [user.id]);

  const handleToggleView = (id) => setExpandedId(prev => (prev === id ? null : id));

  const handleDeleteNotification = (id) => {
    fetch(`http://localhost:4000/api/notifications/${id}`, { method: 'DELETE' })
      .then(res => res.json())
      .then(() => {
        setNotifications(prev => prev.filter(n => n.id !== id));
        if (expandedId === id) setExpandedId(null);
      })
      .catch(err => console.error(err));
  };

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div>
      <div className="settings-card">
        <div className="settings-card-header">
          <h3 className="settings-card-title">My Notifications</h3>
          <p className="settings-card-subtitle">User inbox</p>
        </div>
        <div className="settings-card-content">
          {notifications.length === 0 && <p>No notifications</p>}
          {notifications.map((n) => {
            const isExpanded = expandedId === n.id;
            return (
              <div key={n.id} className="notification-item" 
                   style={{ 
                     display: 'flex', 
                     flexDirection: 'column', 
                     justifyContent: 'space-between', 
                     alignItems: 'stretch', 
                     marginBottom: '1rem', 
                     border: '1px solid #000', 
                     borderRadius: '8px',
                     padding: '0.5rem',
                     backgroundColor: isExpanded ? '#fff6f6ff' : 'transparent'
                   }}>
                
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{n.title}</div>
                    {!isExpanded && <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{n.text}</div>}
                  </div>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button 
                      className="btn btn-outline-primary"
                      style={{ padding: '0.25rem 0.5rem' }}
                      onClick={() => handleToggleView(n.id)}
                    >
                      {isExpanded ? 'Hide' : 'View'}
                    </button>
                    <button 
                      className="btn btn-secondary"
                      style={{ padding: '0.25rem 0.5rem' }}
                      onClick={() => handleDeleteNotification(n.id)}
                    >
                      Delete
                    </button>
                  </div>
                </div>

                {/*expanded */}
                {isExpanded && (
                  <div style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                    {n.text}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default Notification;
