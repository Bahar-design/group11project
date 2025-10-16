import React, { useState, useEffect, useRef } from 'react';

// Fetch volunteers from backend
const fetchVolunteers = async () => {
  const res = await fetch('http://localhost:4000/api/notifications/volunteers');
  if (!res.ok) return [];
  return await res.json();
};

const VolunteerNotifications = ({ user }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [toEmails, setToEmails] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const [message, setMessage] = useState('');
  const [inbox, setInbox] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [expandedId, setExpandedId] = useState(null);
  const [activeButton, setActiveButton] = useState(null); 

  useEffect(() => {
    fetchVolunteers().then(setVolunteers);

    const volunteerId = user?.id || 1;

    // Load notifications
    fetch(`http://localhost:4000/api/notifications/${volunteerId}`)
      .then(res => res.json())
      .then(setNotifications)
      .catch(() => setNotifications([]));

    // Load inbox messages
    fetch(`http://localhost:4000/api/notifications/messages/volunteer/${volunteerId}`)
      .then(res => res.json())
      .then(setInbox)
      .catch(() => setInbox([]));

    setLoading(false);
  }, [user]);

  // Autocomplete logic
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);
    if (value.length > 0) {
      setSuggestions(volunteers.filter(v => v.email.toLowerCase().includes(value.toLowerCase()) && !toEmails.includes(v.email)));
    } else setSuggestions([]);
  };

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

  const handleSuggestionClick = (email) => {
    if (!toEmails.includes(email)) {
      setToEmails([...toEmails, email]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current?.focus();
    }
  };

  const handleRemoveEmail = (email) => setToEmails(prev => prev.filter(e => e !== email));

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

    fetch('http://localhost:4000/api/notifications/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: user.email, to: toEmails, message })
    })
      .then(res => res.json())
      .then(data => {
        if (data?.message === 'Message sent') {
          setSuccess('Message sent!');
          setMessage('');
          setToEmails([]);
          setInputValue('');
          setSuggestions([]);
        } else setError(data?.message || 'Failed to send message.');
      })
      .catch(() => setError('Failed to send message.'))
      .finally(() => setSending(false));
  };

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

  if (loading) return <p>Loading...</p>;

  return (
    <div className="volunteer-notifications-tab">

      {/* Send Message Section*/}
      <section
        className="notifications-section"
        style={{
          backgroundColor: '#fff6f6ff',
          padding: '0',
          borderRadius: '10px',
          border: '2px solid #c78d8dff',
          marginBottom: '1rem'
        }}
      >
     
        <div style={{ backgroundColor: '#ef4444', padding: '0.5rem 1rem', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
          <h3 style={{ color: '#ffffff', margin: 0, fontWeight: '800', fontSize: '1.25rem' }}>Send Message</h3>
        </div>

        <div style={{ padding: '1rem' }}>
          <form onSubmit={handleSend} autoComplete="off">
            <div style={{ position: 'relative', marginBottom: '1rem' }}>
              <label>To:</label>
              <div
                className="email-chips-input"
                onClick={() => inputRef.current?.focus()}
                style={{
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '0.5rem',
                  border: '2px solid #ccc',
                  padding: '0.5rem',
                  borderRadius: '8px'
                }}
              >
                {toEmails.map(email => (
                  <span
                    key={email}
                    style={{
                      backgroundColor: '#d1e7dd',
                      padding: '0.25rem 0.5rem',
                      borderRadius: '5px',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.25rem'
                    }}
                  >
                    {email}
                    <button
                      type="button"
                      style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
                      onClick={() => handleRemoveEmail(email)}
                    >
                      &times;
                    </button>
                  </span>
                ))}
                <input
                  type="text"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  ref={inputRef}
                  placeholder={toEmails.length === 0 ? 'Enter email addresses' : 'Add another...'}
                  style={{ flex: 1, minWidth: 120, border: 'none', outline: 'none', background: 'transparent' }}
                />
              </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
              <label>Message:</label>
              <textarea
                value={message}
                onChange={e => setMessage(e.target.value)}
                rows={4}
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  border: '2px solid #ccc',
                  background: 'white'
                }}
                required
              />
            </div>

            <button
              type="submit"
              onMouseDown={() => setActiveButton('send')}
              onMouseUp={() => setActiveButton(null)}
              style={{
                backgroundColor: activeButton === 'send' ? '#991b1b' : '#ef4444',
                color: '#fff',
                border: 'none',
                padding: '0.5rem 1rem',
                borderRadius: '5px',
                cursor: 'pointer'
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

      {/*Notifications Section*/}
      <section
        className="notifications-section"
        style={{
          backgroundColor: '#fff6f6ff',
          padding: '0',
          borderRadius: '10px',
          border: '2px solid #c78d8dff',
          marginBottom: '1rem'
        }}
      >
      
        <div style={{ backgroundColor: '#ef4444', padding: '0.5rem 1rem', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
          <h3 style={{ color: '#ffffff', margin: 0, fontWeight: '800', fontSize: '1.25rem' }}>Notifications</h3>
        </div>

        <div style={{ padding: '1rem' }}>
          {notifications.length === 0 ? (
            <p>No notifications</p>
          ) : (
            notifications.map(n => {
              const isExpanded = expandedId === n.id;
              return (
                <div
                  key={n.id}
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
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{n.title}</div>
                      {!isExpanded && (
                        <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)' }}>{n.text}</div>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <button
                        style={{
                          backgroundColor: activeButton === `view-${n.id}` ? '#991b1b' : '#ef4444',
                          color: '#fff',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                        onMouseDown={() => setActiveButton(`view-${n.id}`)}
                        onMouseUp={() => setActiveButton(null)}
                        onClick={() => handleToggleView(n.id)}
                      >
                        {isExpanded ? 'Hide' : 'View'}
                      </button>

                      <button
                        style={{
                          backgroundColor: activeButton === `delete-${n.id}` ? '#991b1b' : '#ef4444',
                          color: '#fff',
                          border: 'none',
                          padding: '0.25rem 0.5rem',
                          borderRadius: '5px',
                          cursor: 'pointer'
                        }}
                        onMouseDown={() => setActiveButton(`delete-${n.id}`)}
                        onMouseUp={() => setActiveButton(null)}
                        onClick={() => handleDeleteNotification(n.id)}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                  {isExpanded && (
                    <div style={{ marginTop: '0.5rem', fontSize: '1rem', color: 'var(--text-primary)' }}>
                      {n.text}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </section>

      {/*Inbox Section*/}
      <section
        className="notifications-section"
        style={{
          backgroundColor: '#fff6f6ff',
          padding: '0',
          borderRadius: '10px',
          border: '2px solid #c78d8dff'
        }}
      >
       
        <div style={{ backgroundColor: '#ef4444', padding: '0.5rem 1rem', borderTopLeftRadius: '8px', borderTopRightRadius: '8px' }}>
          <h3 style={{ color: '#ffffff', margin: 0, fontWeight: '800', fontSize: '1.25rem' }}>Inbox</h3>
        </div>

        <div style={{ padding: '1rem' }}>
          {inbox.length === 0 ? (
            <p>No messages</p>
          ) : (
            inbox.map(m => (
              <div
                key={m.id}
                style={{
                  backgroundColor: '#fff6f6ff',
                  padding: '0.5rem',
                  borderRadius: '8px',
                  marginBottom: '0.5rem'
                }}
              >
                <div><strong>From:</strong> {m.from}</div>
                <div>{m.message}</div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  );
};

export default VolunteerNotifications;
