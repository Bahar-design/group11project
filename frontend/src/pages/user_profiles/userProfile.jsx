import { useNavigate } from "react-router-dom";
import Layout from '../../components/layout.jsx';
import AdminProfile from './adminProfile.jsx';
import VolunteerProfile from './volunteerProfile.jsx';
import React, { useState, useEffect } from 'react';
import { UserProfileContext } from './adminInfo';
import API_BASE from '../../lib/apiBase';
import './userProfile.css';
import '../../../styling2/style.css';

const UserProfiles = ({ isLoggedIn, user, onLogout }) => {
  //if (!user) return null; debugging
  if (!user) return <div>Loading...</div>;


  // Initialize profile from localStorage if available, otherwise use passed user
  let initialProfile = user || {};
  try {
    const saved = localStorage.getItem('hh_userProfile');
    if (saved) initialProfile = { ...initialProfile, ...JSON.parse(saved) };
  } catch (e) {
    // ignore parse errors
  }

  const [userProfile, setUserProfile] = useState(initialProfile);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // Load the authoritative profile from the backend and handle "type mismatch" errors
  useEffect(() => {
    let mounted = true;
    async function loadProfile() {
      if (!user?.email) return;
      setLoading(true);
      setError(null);
      const apiBase = API_BASE.replace(/\/$/, '') || '';

      const tryFetch = async (type) => {
        const url = `${apiBase}/api/user-profile?type=${type}&email=${encodeURIComponent(user.email)}`;
        try {
          const res = await fetch(url);
          let data;
          try { data = await res.json(); } catch (e) { data = null; }
          if (!res.ok) {
            const message = data?.message || `HTTP ${res.status}`;
            return { ok: false, status: res.status, message };
          }
          return { ok: true, data };
        } catch (err) {
          return { ok: false, status: 0, message: err.message };
        }
      };

      const primaryType = user.userType || 'volunteer';
      const first = await tryFetch(primaryType);
      if (first.ok) {
        if (!mounted) return;
        setUserProfile(prev => ({ ...prev, ...first.data }));
        try { localStorage.setItem('hh_userProfile', JSON.stringify(first.data)); } catch (e) {}
        setLoading(false);
        return;
      }

      // If server returned explicit type-mismatch, retry with the other type
      if (first.status === 400 && /Requested profile type does not match user type/i.test(first.message || '')) {
        const otherType = primaryType === 'admin' ? 'volunteer' : 'admin';
        const second = await tryFetch(otherType);
        if (second.ok) {
          if (!mounted) return;
          setUserProfile(prev => ({ ...prev, ...second.data }));
          try { localStorage.setItem('hh_userProfile', JSON.stringify(second.data)); } catch (e) {}
          setLoading(false);
          return;
        }
        if (!mounted) return;
        setError(second.message || 'Failed to load profile');
        setLoading(false);
        return;
      }

      if (first.message) setError(first.message);
      setLoading(false);
    }

    loadProfile();
    return () => { mounted = false; };
  }, [user?.email]);

  return (
    <UserProfileContext.Provider value={{ userProfile, setUserProfile }}>
      <Layout 
        currentPage="profile" 
        isLoggedIn={isLoggedIn} 
        onLogout={onLogout}
        showHeader={true}
        user={user}
      >
        <div className="app" style={{ background: 'var(--silver)', minHeight: '100vh' }}>
          <div className="container">
            {loading ? (
              <div>Loading profile...</div>
            ) : error ? (
              <div style={{ color: 'var(--primary-red)' }}>Error loading profile: {error}</div>
            ) : (
              // Render based on the server-returned profile.userType (fall back to passed user.userType)
              ((userProfile && userProfile.userType) || user.userType) === 'admin' ? (
                <AdminProfile user={userProfile} />
              ) : (
                <VolunteerProfile user={userProfile} />
              )
            )}
          </div>
        </div>
      </Layout>
    </UserProfileContext.Provider>
  );
};

export default UserProfiles;