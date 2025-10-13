import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
// ProtectedRoute component
function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

import Login from './pages/logins/login';
import Registration from './pages/registrations/registration';
import Notifications from './pages/notifications/notification'; 
import Calendar from './pages/calendar/calendar';
import MatchMaking from "./pages/volunterMatch/MatchMaking";
import UserProfiles from "./pages/user_profiles/userProfile";
import HomePage from './pages/homepage/HomePage';
import EventsPage from './pages/events/Events';

import './App.css';

export default function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  const handleLogin = (userObj) => {
    setUser(userObj);
    setIsLoggedIn(true);
  };
  const handleLogout = () => {
    setUser(null);
    setIsLoggedIn(false);
  };

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} isLoggedIn={isLoggedIn} />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/events" element={<EventsPage isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/user-profiles" element={
          <ProtectedRoute isLoggedIn={isLoggedIn}>
            <UserProfiles user={user} onLogout={handleLogout} />
          </ProtectedRoute>
        } />
        <Route path="/notifications" element={<Notifications isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/calendar" element={<Calendar isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/match-making" element={<MatchMaking isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}
