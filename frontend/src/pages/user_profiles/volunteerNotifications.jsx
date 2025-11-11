import React, { useState, useEffect, useRef } from 'react';
import API_BASE from '../../lib/apiBase';

const VolunteerNotifications = ({ user }) => {
  const [notifications, setNotifications] = useState([]);
  const [toEmails, setToEmails] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activeButton, setActiveButton] = useState(null);
  const inputRef = useRef(null);

  //New states for autocomplete
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);

  //Load notifications for the logged-in user
  useEffect(() => {
    const fetchNotifications = async () => {
      if (!user?.email) return;
      try {
        const res = await fetch(`${API_BASE}/api/notifications?email=${encodeURIComponent(user.email)}`);
        const data = await res.json();
        setNotifications(Array.isArray(data) ? data : []);
      } catch (err) {
        console.error('Error loading notifications:', err);
        setNotifications([]);
      } finally {
        setLoading(false);
      }
    };
    fetchNotifications();
  }, [user]);

  //Fetch autocomplete suggestions from backend
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

      //ensure lowercase comparison
      setSuggestions(
        data.filter(email => !toEmails.includes(email.toLowerCase()))
      );
    } catch (err) {
      console.error('Error fetching email suggestions:', err);
    }
  };

  //Add recipient when pressing Enter, comma, or Tab
  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      const email = inputValue.trim();
      if (email && !toEmails.includes(email) && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setToEmails([...toEmails, email]);
        setInputValue('');
        setSuggestions([]);
      }
    } else if (e.key === 'Backspace' && !inputValue && toEmails.length > 0) {
      setToEmails(prev => prev.slice(0, -1));
    }
  };

  //Add recipient from suggestion
  const handleSuggestionClick = (email) => {
    if (!toEmails.includes(email)) {
      setToEmails([...toEmails, email]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  //Delete notification
  const handleDeleteNotification = async (id) => {
    try {
      await fetch(`${API_BASE}/api/notifications/${id}`, { method: 'DELETE' });
      setNotifications(prev => prev.filter(n => n.message_ID !== id));
    } catch (err) {
      console.error('Error deleting notification:', err);
    }
  };

  //Toggle expand/hide message view
  const handleToggleView = (id) => {
    setExpandedId(prev => (prev === id ? null : id));
  };

  //Send message
  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(null);

    if (!message || toEmails.length === 0) {
      setError('Please provide recipients and a message.');
      setSending(false);
      return;
    }

    try {
      const res = await fetch(`${API_BASE}/api/notifications/message`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        //normalize emails before sending -just in case
        body: JSON.stringify({
          from: user.email.trim().toLowerCase(),
          to: toEmails[0].trim().toLowerCase(),
          message,
        }),
      });

      const data = await res.json();
      if (res.ok && data?.message === 'Message sent') {
        setSuccess('Message sent!');
        setMessage('');
        setToEmails([]);
        setInputValue('');
      } else {
        setError(data?.message || 'Failed to send message.');
      }
    } catch {
      setError('Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  if (loading) return <p>Loading notifications...</p>;

  return (
    <div className="volunteer-notifications-tab">
      {/* Send Message Section */}
      <section
        className="notifications-section"
        style={{
          backgroundColor: '#fff6f6ff',
          borderRadius: '10px',
          border: '2px solid #c78d8dff',
          marginBottom: '1rem',
        }}
      >
        <div
          style={{
            backgroundColor: '#ef4444',
            padding: '0.5rem 1rem',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
        >
          <h3
            style={{
              color: '#ffffff',
              margin: 0,
              fontWeight: '800',
              fontSize: '1.25rem',
            }}
          >
            Send Message
          </h3>
        </div>
        <div style={{ padding: '1rem' }}>
          <form onSubmit={handleSend}>
            <label>To:</label>
            <div style={{ position: 'relative' }}>
              <input
                type="text"
                ref={inputRef}
                placeholder="Enter recipient email"
                value={inputValue}
                onChange={handleInputChange}
                onKeyDown={handleInputKeyDown}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  marginBottom: '1rem',
                  borderRadius: '8px',
                  border: '1px solid #ccc',
                }}
              />
              {showSuggestions && suggestions.length > 0 && (
                <ul
                  style={{
                    position: 'absolute',
                    zIndex: 10,
                    background: '#fff',
                    border: '1px solid #ccc',
                    borderRadius: '4px',
                    margin: 0,
                    padding: 0,
                    listStyle: 'none',
                    left: 0,
                    right: 0,
                    maxHeight: '150px',
                    overflowY: 'auto',
                  }}
                >
                  {suggestions.map((email, i) => (
                    <li
                      key={i}
                      style={{
                        padding: '0.5rem',
                        cursor: 'pointer',
                        borderBottom: '1px solid #eee',
                      }}
                      onMouseDown={(e) => e.preventDefault()}
                      onClick={() => handleSuggestionClick(email)}
                    >
                      {email}
                    </li>
                  ))}
                </ul>
              )}
            </div>

            {toEmails.length > 0 && (
              <div style={{ marginBottom: '1rem' }}>
                <strong>Recipients:</strong> {toEmails.join(', ')}
              </div>
            )}

            <label>Message:</label>
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              rows={4}
              style={{
                width: '100%',
                padding: '0.5rem',
                borderRadius: '8px',
                border: '2px solid #ccc',
                background: 'white',
              }}
            />
            <button
              type="submit"
              style={{
                backgroundColor: '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer',
                marginTop: '0.5rem',
              }}
              disabled={sending}
            >
              {sending ? 'Sending...' : 'Send Message'}
            </button>
            {error && <p style={{ color: '#b91c1c', marginTop: '0.5rem' }}>{error}</p>}
            {success && <p style={{ color: '#16a34a', marginTop: '0.5rem' }}>{success}</p>}
          </form>
        </div>
      </section>

      {/* Notifications Section */}
      <section
        className="notifications-section"
        style={{
          backgroundColor: '#fff6f6ff',
          borderRadius: '10px',
          border: '2px solid #c78d8dff',
        }}
      >
        <div
          style={{
            backgroundColor: '#ef4444',
            padding: '0.5rem 1rem',
            borderTopLeftRadius: '8px',
            borderTopRightRadius: '8px',
          }}
        >
          <h3
            style={{
              color: '#ffffff',
              margin: 0,
              fontWeight: '800',
              fontSize: '1.25rem',
            }}
          >
            Notifications
          </h3>
        </div>
        <div style={{ padding: '1rem' }}>
          {!Array.isArray(notifications) || notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map((n) => {
              const isExpanded = expandedId === n.message_ID;
              return (
                <div
                  key={n.message_ID}
                  style={{
                    border: '1px solid #000',
                    borderRadius: '8px',
                    padding: '0.5rem',
                    marginBottom: '1rem',
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                    }}
                  >
                    <div>
                      <div style={{ fontWeight: 600 }}>{n.message_from}</div>
                      {!isExpanded && (
                        <div style={{ fontSize: '0.9rem' }}>{n.message_text}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        onClick={() => handleToggleView(n.message_ID)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '0.25rem 0.5rem',
                        }}
                      >
                        {isExpanded ? 'Hide' : 'View'}
                      </button>
                      <button
                        onClick={() => handleDeleteNotification(n.message_ID)}
                        style={{
                          backgroundColor: '#ef4444',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '0.25rem 0.5rem',
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: '0.5rem' }}>{n.message_text}</div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>
    </div>
  );
};

export default VolunteerNotifications;
