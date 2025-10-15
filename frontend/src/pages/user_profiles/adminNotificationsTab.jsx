import React, { useState, useEffect, useRef } from 'react';

// Fetch volunteers from backend
const fetchVolunteers = async () => {
  const res = await fetch('http://localhost:4000/api/notifications/volunteers');
  if (!res.ok) return [];
  return await res.json();
};

const AdminNotificationsTab = ({ user }) => {
  const [volunteers, setVolunteers] = useState([]);
  const [toEmails, setToEmails] = useState([]); // array of emails
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

  useEffect(() => {
    fetchVolunteers().then(setVolunteers);
    // Use loginController.js logic: admin is id=2, volunteer is id=1
    let adminId = 2;
    if (user && user.type === 'admin') adminId = 2;
    else if (user && user.type === 'volunteer') adminId = 1;
    else adminId = 2; // fallback to admin
    fetch(`http://localhost:4000/api/notifications/${adminId}`)
      .then(res => res.json())
      .then(setNotifications)
      .catch(() => setNotifications([]));
    fetch(`http://localhost:4000/api/notifications/messages/admin/${adminId}`)
      .then(res => res.json())
      .then(setInbox)
      .catch(() => setInbox([]));
    setLoading(false);
  }, [user]);

  // When sendToAll toggled, update toEmails
  useEffect(() => {
    if (sendToAll) {
      setToEmails(volunteers.map(v => v.email));
      setInputValue('');
      setSuggestions([]);
    } else {
      setToEmails([]);
    }
  }, [sendToAll, volunteers]);

  // Autocomplete logic for email input
  const handleInputChange = (e) => {
    const value = e.target.value;
    setInputValue(value);
    setShowSuggestions(true);
    if (value.length > 0) {
      setSuggestions(volunteers.filter(v => v.email.toLowerCase().includes(value.toLowerCase()) && !toEmails.includes(v.email)));
    } else {
      setSuggestions([]);
    }
  };

  const handleInputKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ',' || e.key === 'Tab') {
      e.preventDefault();
      if (inputValue.trim() && !toEmails.includes(inputValue.trim()) && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(inputValue.trim())) {
        setToEmails([...toEmails, inputValue.trim()]);
        setInputValue('');
        setSuggestions([]);
      }
    } else if (e.key === 'Backspace' && !inputValue && toEmails.length > 0) {
      setToEmails(toEmails.slice(0, -1));
    }
  };

  const handleSuggestionClick = (email) => {
    if (!toEmails.includes(email)) {
      setToEmails([...toEmails, email]);
      setInputValue('');
      setSuggestions([]);
      setShowSuggestions(false);
      inputRef.current && inputRef.current.focus();
    }
  };

  const handleRemoveEmail = (email) => {
    setToEmails(toEmails.filter(e => e !== email));
    setSendToAll(false);
  };

  const handleToggleSendToAll = () => {
    setSendToAll((prev) => !prev);
    setInputValue('');
    setSuggestions([]);
  };

  const handleSend = async (e) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    setSuccess(null);
    let recipients = toEmails;
    if (recipients.length === 0 || !message) {
      setError('Please specify recipients and a message.');
      setSending(false);
      return;
    }
    fetch('http://localhost:4000/api/notifications/message', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ from: user.email, to: recipients, message })
    })
      .then(res => res.json())
      .then(data => {
        if (data && data.message === 'Message sent') {
          setSuccess('Message sent!');
          setMessage('');
          setToEmails([]);
          setInputValue('');
          setSendToAll(false);
          setSuggestions([]);
        } else {
          setError(data && data.message ? data.message : 'Failed to send message.');
        }
      })
      .catch(() => setError('Failed to send message.'))
      .finally(() => setSending(false));
  };

  if (loading) return <p>Loading...</p>;

  return (
    <div className="admin-notifications-tab">
      <section className="admin-notifications-section">
        <h3 className="admin-notifications-title">Send Message to Volunteers</h3>
        <form onSubmit={handleSend} className="admin-notifications-form" autoComplete="off">
          <div className="form-group" style={{ position: 'relative', minHeight: 48 }}>
            <label>To:</label>
            <div className="email-chips-input" onClick={() => inputRef.current && inputRef.current.focus()}>
              {toEmails.map(email => (
                <span className="email-chip" key={email}>
                  {email}
                  <button type="button" className="email-chip-remove" onClick={e => { e.stopPropagation(); handleRemoveEmail(email); }}>&times;</button>
                </span>
              ))}
              {!sendToAll && (
                <input
                  type="text"
                  className="form-input email-input"
                  value={inputValue}
                  onChange={handleInputChange}
                  onKeyDown={handleInputKeyDown}
                  placeholder={toEmails.length === 0 ? "Enter email addresses" : "Add another..."}
                  ref={inputRef}
                  onFocus={() => setShowSuggestions(true)}
                  autoComplete="off"
                  style={{ minWidth: 120, flex: 1, border: 'none', boxShadow: 'none', outline: 'none', background: 'transparent', padding: 0, margin: 0 }}
                />
              )}
            </div>
            <button type="button" className={`btn-secondary btn-send-all${sendToAll ? ' active' : ''}`} onClick={handleToggleSendToAll}>
              {sendToAll ? 'Undo Send to All' : 'Send to All Volunteers'}
            </button>
            {showSuggestions && suggestions.length > 0 && !sendToAll && (
              <ul className="email-suggestions-list">
                {suggestions.map(v => (
                  <li key={v.email} className="email-suggestion-item" onClick={() => handleSuggestionClick(v.email)}>
                    {v.email} <span style={{ color: '#888', fontSize: '0.95em' }}>({v.name})</span>
                  </li>
                ))}
              </ul>
            )}
          </div>
          <div className="form-group">
            <label>Message:</label>
            <textarea
              className="form-input"
              value={message}
              onChange={e => setMessage(e.target.value)}
              rows={4}
              required
            />
          </div>
          <button type="submit" className="btn-primary" disabled={sending}>{sending ? 'Sending...' : 'Send Message'}</button>
          {error && <div className="form-error">{error}</div>}
          {success && <div className="form-success">{success}</div>}
        </form>
      </section>

      <section className="admin-notifications-section">
        <h3 className="admin-notifications-title">Notifications</h3>
        {notifications.length === 0 && <p>No notifications</p>}
        {notifications.map(n => (
          <div key={n.id} className="admin-notification-item">
            <strong>{n.title}</strong>
            <div>{n.text}</div>
          </div>
        ))}
      </section>

      <section className="admin-notifications-section">
        <h3 className="admin-notifications-title">Inbox (Messages from Volunteers)</h3>
        {(!Array.isArray(inbox) || inbox.length === 0) && <p>No messages</p>}
        {Array.isArray(inbox) && inbox.map(m => (
          <div key={m.id} className="admin-inbox-item">
            <div><strong>From:</strong> {m.from}</div>
            <div>{m.message}</div>
          </div>
        ))}
      </section>
    </div>
  );
};

export default AdminNotificationsTab;
