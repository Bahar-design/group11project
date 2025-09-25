import React from 'react';
import NavBar from './components/NavBar';
import Login from './pages/logins/login';
import Registration from './pages/registrations/registration';
import Notifications from './pages/notifications/notification'; 
import Calendar from './pages/calendar/calendar';
import MatchMaking from "./pages/volunterMatch/MatchMaking";
import UserProfiles from "./pages/user_profiles/userProfile";
import HomePage from './homepage/HomePage';



import './App.css';


export default function App() {
  return (
    <div>
      {/*<NavBar />*/}
      {/* <Calendar /> */} 
      {/* <Notifications /> */}
     {/* < Registration /> */}
     {/*<MatchMaking /> */}
      {/* <Login /> */} 
      {/*<UserProfiles /> */}
      <HomePage /> 
      </div>
  );
}
