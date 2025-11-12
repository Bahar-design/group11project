import React, { useState, useEffect } from 'react'; 
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";

//protectedRoute component for refreshing logged in state
function ProtectedRoute({ isLoggedIn, children }) {
  if (!isLoggedIn) {
    return <Navigate to="/login" replace />;
  }
  return children;
}

import Header from './components/header.jsx';
import Login from './pages/logins/login';
import Registration from './pages/registrations/registration';
import Calendar from './pages/calendar/calendar';
import MatchMaking from "./pages/volunterMatch/MatchMaking";
import UserProfiles from "./pages/user_profiles/userProfile";
import HomePage from './pages/homepage/HomePage';
import EventsPage from './pages/events/Events';
import ReportingModule from './pages/reports/reportingModule';
import About from "./pages/about/about.jsx";
import './App.css';

export default function App() {

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [user, setUser] = useState(null);

  //restore login/session on page refresh
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const storedLoggedIn = localStorage.getItem("isLoggedIn");

    if (storedLoggedIn === "true" && storedUser) {
      setUser(JSON.parse(storedUser));
      setIsLoggedIn(true);
    }
  }, []);


    //handle login
    const handleLogin = (userObj) => {
      setUser(userObj);
      setIsLoggedIn(true);
    };

    //localStorage when logging out
    const handleLogout = () => {
      setUser(null);
      setIsLoggedIn(false);
      localStorage.removeItem("user");        
      localStorage.removeItem("isLoggedIn");  
    };

    return (
      
      <Router>
        <Routes>
          <Route path="/" element={<HomePage isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user} />} /> 
          <Route path="/login" element={<Login onLogin={handleLogin} isLoggedIn={isLoggedIn} user={user} />} /> 
          <Route path="/register" element={<Registration isLoggedIn={isLoggedIn} user={user} onLogin={handleLogin} />} />
          <Route path="/about" element={<About isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user} />} />

          <Route path="/events" element={<EventsPage isLoggedIn={isLoggedIn} user={user} />} />
          <Route path="/reports" element={<ReportingModule isLoggedIn={isLoggedIn} user={user} />} />
          <Route path="/user-profiles" element={
            <ProtectedRoute isLoggedIn={isLoggedIn}>
              <UserProfiles isLoggedIn={isLoggedIn} user={user} onLogout={handleLogout} />
            </ProtectedRoute>
          } />
          <Route path="/calendar" element={<Calendar isLoggedIn={isLoggedIn} onLogout={handleLogout} user={user} />} />
          <Route path="/match-making" element={<MatchMaking isLoggedIn={isLoggedIn} user={user} />} />
        </Routes>
      </Router>
    );
}
