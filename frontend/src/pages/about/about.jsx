// group11project/frontend/src/pages/about/about.jsx`
//* in the about page we must detail what our volunteer services offer
//* 1. Task urgency and priority
//* 2. user proper notification and messaging paths
//* 3. user match making capabilities
//* 4. volunteer history
//* 
//*
import React from "react";
import "./about.css";
import Layout from "../../components/layout.jsx"; // note the .jsx
import volunteerImg from "./images/image.png";

export default function About({ isLoggedIn, onLogout, user }) {
  return (
    <Layout currentPage="about" isLoggedIn={isLoggedIn} onLogout={onLogout} user={user}>
      <section>

        <h1 className="flex items-center justify-center font-bold mb-4">About Houston 
          <span className="text-red-500 font-bold ml-2"> Hearts</span>
        </h1>
        <p className="flex items-center justify-center">
          We connect volunteers with local events using skills, availability, and proximity –– making it easier to give back to the community
        </p>

        <div className="flex flex-wrap justify-center gap-8 mt-8">
          <div className="flex flex-row">
            <div classname="flex-col justify-center items-center max-w-xs">
              <h2 className="text-xl font-semibold text-gray-700">
                🎯 Our Mission
              </h2>
              <p className="text-gray-600 max-w-80">
                To strengthen communities by empowering volunteers to easily find meaningful opportunities.
              </p>
            </div>
          </div>
          
          <div className="rounded-2xl shadow-lg overflow-hidden">
            <img
              src={volunteerImg}
              alt="volunteer image"
              className="w-80 h-80 object-cover" 
            />
          </div>

        </div>

        <div className="flex flex-wrap justify-center gap-8 mt-8">
          <div className="flex flex-col items-center max-w-xs">
            <h2 className="text-xl font-semibold text-gray-700">
              💡 How It Works
              </h2>
            <p className="text-gray-600">
              Our smart matching system pairs volunteers and events based on skills, time slots, and locations.
            </p>
          </div>
        </div>

      </section>
    </Layout>
  );
}


//! properly connected now!!!!