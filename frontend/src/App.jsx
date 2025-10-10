import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

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

  const handleLogin = () => setIsLoggedIn(true);
  const handleLogout = () => setIsLoggedIn(false);

  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/login" element={<Login onLogin={handleLogin} isLoggedIn={isLoggedIn} />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/events" element={<EventsPage isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/user-profiles" element={<UserProfiles isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/notifications" element={<Notifications isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/calendar" element={<Calendar isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
        <Route path="/match-making" element={<MatchMaking isLoggedIn={isLoggedIn} onLogout={handleLogout} />} />
      </Routes>
    </Router>
  );
}
