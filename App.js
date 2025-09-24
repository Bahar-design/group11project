// App.js
import React, { useState } from "react";
import HomePage from "./HomePage";
import VolunteerHistory from "./VolunteerHistory";
import './App.css';

function App() {
  const [showHistory, setShowHistory] = useState(false);

  const toggleHistory = () => {
    setShowHistory(!showHistory);
  };

  return (
    <div className="App">
      <HomePage />
      
      <div className="text-center my-6">
      <button
  onClick={toggleHistory}
  className="volunteer-history-btn"
>
  {showHistory ? "Hide Volunteer History" : "Show Volunteer History"}
</button>

      </div>

      {showHistory && <VolunteerHistory />}
    </div>
  );
}

export default App;
