// frontend/src/pages/AdminNotificationsTab.jsx
import React, { useState, useEffect, useRef } from 'react';
import API_BASE from '../../lib/apiBase';

const fetchVolunteers = async () => {
  try {
    const res = await fetch(`${API_BASE}/api/notifications/volunteers`);
    if (!res.ok) return [];
    const data = await res.json();
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
};

const AdminNotificationsTab = ({ user }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [toEmails, setToEmails] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [sendToAll, setSendToAll] = useState(false);
  const [inbox, setInbox] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  // Load volunteers, notifications, and inbox
  useEffect(() => {
    const loadData = async () => {
      try {
        const vols = await fetchVolunteers();
        setVolunteers(vols);

        // Get admin email
        const adminEmail = user?.email;
        if (adminEmail) {
          // Notifications (sent to admin)
          const notifRes = await fetch(`${API_BASE}/api/notifications?email=${encodeURIComponent(adminEmail)}`);
          const notifData = await notifRes.json();
          setNotifications(Array.isArray(notifData) ? notifData : []);

          // Inbox (messages from volunteers)
          const inboxRes = await fetch(`${API_BASE}/api/notifications/all`);
          const inboxData = await inboxRes.json();
          setInbox(Array.isArray(inboxData) ? inboxData.filter(n => n.message_to === adminEmail) : []);
        } else {
          setNotifications([]);
          setInbox([]);
        }
      } catch (err) {
        console.error('Error loading notifications:', err);
        setNotifications([]);
        setInbox([]);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, [user]);

  //When sendToAll toggled, update recipients
  useEffect(() => {
    if (sendToAll) {
      setToEmails(volunteers.map(v => v.email));
      setInputValue('');
      setSuggestions([]);
    } else {
      setToEmails([]);
    }
  }, [sendToAll, volunteers]);

  const handleInputChange = async (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);

    if (value.length < 2) {
      setSuggestions([]);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/notifications/emails?query=${encodeURIComponent(value)}`);
      if (!res.ok) return;
      const data = await res.json();
      //Lowercase filtering and shape consistency -just in case
      setSuggestions(
        data
          .filter(email => !toEmails.includes(email.toLowerCase()))
          .map(email => ({ email }))
      );
    } catch (err) {
      console.error('Error fetching email suggestions:', err);
    }
  };

  const handleSuggestionClick = (email) => {
    if (!toEmails.includes(email)) {
      setToEmails([...toEmails, email]);
      setInputValue('');
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleRemoveEmail = (email) => {
    setToEmails(prev => prev.filter(e => e !== email));
    setSendToAll(false);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(null);

    if (!message || toEmails.length === 0) {
      setError('Please specify recipients and a message.');
      setSending(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/notifications/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        //Normalize casing before sending
        body: JSON.stringify({
          from: user.email.trim().toLowerCase(),
          to: toEmails.map(e => e.trim().toLowerCase()).join(', '),
          message
        })
      });

      const data = await res.json();
      if (res.ok && data.message === 'Message sent') {
        setSuccess('Message sent!');
        setMessage('');
        setToEmails([]);
        setSendToAll(false);
      } else {
        setError(data.message || 'Failed to send message.');
      }
    } catch {
      setError('Error sending message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-notifications-tab">
      {/* Send Message Section */}
      <section
        className="admin-notifications-section"
        style={{
          backgroundColor: '#fff6f6ff',
          borderRadius: '10px',
          border: '2px solid #c78d8dff',
          marginBottom: '1rem'
        }}
      >
        <div
          style={{
            backgroundColor: '#ef4444',
            padding: '0.5rem 1rem',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px'
          }}
        >
          <h3 style={{ color: '#ffffff', margin: 0, fontWeight: '800', fontSize: '1.25rem' }}>
            Send Message to Volunteers
          </h3>
        </div>

        <div style={{ padding: '1rem' }}>
          <form onSubmit={handleSend} autoComplete="off">
            <label>To:</label>
            <div style={{ position: 'relative' }}>
              <div className="email-chips-input" onClick={() => inputRef.current?.focus()}>
                {toEmails.map(email => (
                  <span key={email} className="email-chip">
                    {email}
                    <button
                      type="button"
                      onClick={() => handleRemoveEmail(email)}
                      className="email-chip-remove"
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  ref={inputRef}
                  value={inputValue}
                  onChange={handleInputChange}
                  placeholder={toEmails.length === 0 ? 'Enter email addresses' : 'Add another...'}
                  style={{
                    width: '100%',
                    padding: '0.5rem',
                    borderRadius: '8px',
                    border: '1px solid #ccc',
                    marginBottom: '1rem'
                  }}
                />
                {showSuggestions && suggestions.length > 0 && (
                  <ul
                    className="email-suggestions-list"
                    style={{
                      position: 'absolute',
                      zIndex: 20,
                      background: '#fff',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      margin: 0,
                      padding: 0,
                      listStyle: 'none',
                      left: 0,
                      right: 0,
                      top: '100%',
                      maxHeight: '180px',
                      overflowY: 'auto',
                      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                    {suggestions.map(v => (
                      <li
                        key={v.email}
                        onClick={() => handleSuggestionClick(v.email)}
                        style={{
                          padding: '0.5rem',
                          cursor: 'pointer',
                          borderBottom: '1px solid #eee'
                        }}
                        onMouseDown={(e) => e.preventDefault()}
                      >
                        {v.email}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            <div className="form-group">
              <label>Message:</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                required
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '2px solid #ccc',
                  background: 'white',
                  marginBottom: '1rem'
                }}
              />
            </div>

            <button
              type="submit"
              className="btn-primary"
              disabled={sending}
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
              }}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>

            {error && <div className="form-error" style={{ color: '#b91c1c', marginTop: '0.5rem' }}>{error}</div>}
            {success && <div className="form-success" style={{ color: '#16a34a', marginTop: '0.5rem' }}>{success}</div>}
          </form>
        </div>
      </section>

      {/* Notifications */}
      <section className="admin-notifications-section">
        <h3>Notifications</h3>
        {Array.isArray(notifications) && notifications.length > 0 ? (
          notifications.map(n => (
            <div key={n.message_ID} className="admin-notification-item">
              <strong>From:</strong> {n.message_from}
              <div>{n.message_text}</div>
            </div>
          ))
        ) : (
          <p>No notifications</p>
        )}
      </section>

      {/* Inbox */}
      <section className="admin-notifications-section">
        <h3>Inbox (Messages from Volunteers)</h3>
        {Array.isArray(inbox) && inbox.length > 0 ? (
          inbox.map(m => (
            <div key={m.message_ID} className="admin-inbox-item">
              <div><strong>From:</strong> {m.message_from}</div>
              <div>{m.message_text}</div>
            </div>
          ))
        ) : (
          <p>No messages</p>
        )}
      </section>
    </div>
  );
};

export default AdminNotificationsTab;
