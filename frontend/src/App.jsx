import React from 'react';
import NavBar from './components/NavBar';
import Login from './pages/login';
import Registration from './pages/registration';
import Notifications from './pages/notifications/notification'; 
import Calendar from './pages/calendar/calendar';
import MatchMaking from "./pages/volunterMatch/MatchMaking";
import UserProfiles from "./pages/user_profiles/userProfile";



import './App.css';


export default function App() {
  return (
    <div>
      <NavBar />
       {/* <Calendar /> *} 
      {/*<Notifications />*/}  
     {/* < Registration /> */} 
     {/*<MatchMaking /> */}
      {/*<Login />  */}
      <UserProfiles />
      </div>
  );
}
