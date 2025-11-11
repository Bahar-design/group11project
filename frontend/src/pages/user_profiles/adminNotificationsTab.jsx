
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

  // When sendToAll toggled, update recipients
  useEffect(() => {
    if (sendToAll) {
      setToEmails(volunteers.map(v => v.email));
      setInputValue('');
      setSuggestions([]);
    } else {
      setToEmails([]);
    }
  }, [sendToAll, volunteers]);

  /*
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);
    if (value.length > 0) {
      setSuggestions(
        volunteers.filter(v =>
          v.email.toLowerCase().includes(value.toLowerCase()) &&
          !toEmails.includes(v.email)
        )
      );
    } else {
      setSuggestions([]);
    }
  };
  */

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
    // data is an array of emails (["maria.d@houstonhearts.org", ...])
    setSuggestions(
      data
        .filter(email => !toEmails.includes(email))
        .map(email => ({ email })) // keep consistent shape
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
        body: JSON.stringify({
          from: user.email,
          to: toEmails.join(', '),
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
      <section className="admin-notifications-section">
        <h3>Send Message to Volunteers</h3>
        <form onSubmit={handleSend} autoComplete="off">
          <div className="form-group">
            <label>To:</label>
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
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul className="email-suggestions-list">
                  {suggestions.map(v => (
                    <li key={v.email} onClick={() => handleSuggestionClick(v.email)}>
                      {v.email} <span style={{ color: '#888' }}>({v.name})</span>
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
            />
          </div>

          <button type="submit" className="btn-primary" disabled={sending}>
            {sending ? 'Sending...' : 'Send Message'}
          </button>

          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
        </form>
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
