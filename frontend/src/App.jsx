// src/App.jsx
import React from "react";
import NavBar from "./components/NavBar.jsx";
import Login from "./pages/login.jsx";
import "./App.css";

export default function App() {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        minHeight: "100vh", // Full viewport height
      }}
    >
      <NavBar />
      <Login />  
    </div>
  );
}
