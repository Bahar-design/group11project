import React from 'react';
import Login from './pages/logins/login';
import Registration from './pages/registrations/registration';
import Notifications from './pages/notifications/notification'; 
import Calendar from './pages/calendar/calendar';
import MatchMaking from "./pages/volunterMatch/MatchMaking";
import UserProfiles from "./pages/user_profiles/userProfile";
import HomePage from './pages/homepage/HomePage';
import EventsPage from './pages/events/Events';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";   //needed for navigation: npm install react-router-dom


import './App.css';

export default function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Registration />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/user-profiles" element={<UserProfiles />} />
        <Route path="/notifications" element={<Notifications />} />
        <Route path="/calendar" element={<Calendar />} />
        <Route path="/match-making" element={<MatchMaking />} />
      </Routes>
    </Router>
  );
}