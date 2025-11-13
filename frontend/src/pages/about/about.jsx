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
import volunteerImg2 from "./images/image2.png";
import volunteerImg3 from "./images/image3.png";

export default function About({ isLoggedIn, onLogout, user }) {
  
  return (
    <Layout currentPage="about" isLoggedIn={isLoggedIn} onLogout={onLogout} user={user}>
      <section className="flex flex-col gap-20"> {/**fixed the section spacing issue */}

        <section> 
          <h1 className="flex items-center justify-center font-bold mb-3">
            About Houston <span className="text-red-500 font-bold">Hearts</span>
          </h1>
          <p className="text-center max-w-2xl mx-auto mb-3"> {/*this were the margin are having issues, this is the only thing seeting margin bottom size*/}
              We connect volunteers with local houston events using skills, availability, and proximity –– making it easier to give back to the community and gain volunteering Hours
          </p>
        </section>
        
        <section> 
          <div className="flex items-center justify-center flex-row">
            <div className="flex-col max-w-xs">
              <h2 className="text-xl font-semibold text-gray-700">
                🎯 Our Mission
              </h2>
              <p className="text-gray-600 max-w-80">
                We aim to strengthen our houston communities by empowering volunteers to easily find meaningful opportunities.
              </p>
            </div>
            <div className="rounded-2xl shadow-lg overflow-hidden">
              <img
                src={volunteerImg}
                alt="volunteer-image"
                className="w-[500px] h-[350px]" 
              />
            </div>
          </div>
        </section>

        <section>
          <div className="flex flex-wrap items-center justify-center gap-8 flex-row"> 
            <div className="rounded-2xl shadow-lg overflow-hidden">
              <img 
                src={volunteerImg2}
                alt="volunteer_photo2"
                className="w-[500px] h-[350px]"
              />
            </div>
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

        {/* this one will be about our volunteer history tracking */}
        <section>
          <div className="flex flex-row items-center justify-center gap-8">
            <div className="flex-col ">
              <h2 className="text-2xl font-semibold text-gray-700">📊 Volunteer Hours & History</h2>

              <p className="text-gray-600 leading-relaxed max-w-96">
                Houston Hearts keeps a complete record of every volunteer's service activity —
                including hours contributed, events participated in, and roles performed.
              </p>

              <p className="text-gray-600 leading-relaxed max-w-96">
                Volunteers can review their past events, track their total hours, and build a verified
                impact profile that highlights their dedication to the community.
              </p>

              <p className="text-gray-600 leading-relaxed max-w-96">
                Our system automatically updates each user’s history after every event,
                making it easy to stay organized and monitor your community contributions.
              </p>
            </div>
            <div className=" rounded-2xl shadow-lg overflow-hidden">
              <img
                src={volunteerImg3}
                alt="volunteer_img3"
                className="w-[500px] h-[350px]"
                />
            </div>
          </div>
        </section>

      </section>
    </Layout>
  );
}


//! properly connected now!!!!