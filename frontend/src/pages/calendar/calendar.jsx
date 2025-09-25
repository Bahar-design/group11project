// src/pages/calendar.jsx

import React, { useState } from "react";
import { Calendar as Calendars, momentLocalizer } from "react-big-calendar";  //library for event calendar
import moment from "moment";
import NavBar from "../../components/NavBar.jsx";  //may need it later
import Footer from "../../components/footer.jsx";
import Header from "../../components/header.jsx";
import "react-big-calendar/lib/css/react-big-calendar.css";
import "./calendar.css";


const localizer = momentLocalizer(moment);

export default function MyCalendar() {
  const [events] = useState([
    {
      title: "Team Meeting",
      start: new Date(2025, 8, 20, 10, 0),
      end: new Date(2025, 8, 20, 11, 0),
    },
    {
      title: "Project Deadline",
      start: new Date(2025, 8, 25),
      end: new Date(2025, 8, 25),
    },
  ]);

  return (
    <div>
      <Header />
      <div
      //for the size of the calendar
        style={{
          height: "80vh",          
          margin: "30px 60px 50px", 
        }}
      >
        <Calendars
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          style={{ height: "100%", width: "100%" }}
        />
      </div>
      <Footer />
    </div>
  );
}



