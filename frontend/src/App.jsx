import React from 'react';
import NavBar from './components/NavBar';
import Login from './pages/login';
import Registration from './pages/registration';
import Notifications from './pages/notification'; 
import Calendar from './pages/calendar';

import './App.css';

export default function App() {
  return (
    <div>
      <NavBar />
      <Calendar />
    </div>
  );
}
