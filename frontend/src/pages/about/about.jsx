// group11project/frontend/src/pages/about/about.jsx
import React from "react";
import "./about.css";
import Layout from "../../components/layout.jsx";
import volunteerImg1 from "./images/image1.png";
import volunteerImg2 from "./images/image2.png";
import volunteerImg3 from "./images/image3.png";

export default function About({ isLoggedIn, onLogout, user }) {
  return (
    <Layout currentPage="about" isLoggedIn={isLoggedIn} onLogout={onLogout} user={user}>
      <section className="flex flex-col gap-10">
        
        {/* Hero / Intro */}
        <section>
          <h1 className="flex items-center justify-center font-bold mb-3 text-3xl gap-2">
            About Houston <span className="text-red-500 font-bold">Hearts</span>
          </h1>
          <p className="text-center max-w-2xl mx-auto mb-3">
            Houston Hearts is a volunteer matchmaking platform that connects people to local
            community events across the Houston area. We use your skills, availability, and
            location to make it simple to find the right opportunity and earn verified
            volunteering hours.
          </p>
        </section>

        {/* Mission / Impact */}
        <section>
          <div className="flex items-center justify-center flex-row gap-10 flex-wrap">
            <div className="flex flex-col max-w-xs">
              <h2 className="text-xl font-semibold text-gray-700">
                🎯 Our Mission
              </h2>
              <p className="text-gray-600 max-w-80">
                Our mission is to strengthen Houston communities by making service easy,
                organized, and impactful. We help volunteers discover meaningful events, and
                we help organizers quickly find the support they need.
              </p>
              <p className="text-gray-600 max-w-80 mt-3">
                Every event is tagged with urgency and priority levels, so the most time-sensitive
                drives and projects get the attention they need first.
              </p>
            </div>
            <div className="rounded-2xl shadow-lg overflow-hidden">
              <img
                src={volunteerImg1}
                alt="Volunteers supporting a local event"
                className="w-[500px] h-[350px]"
              />
            </div>
          </div>
        </section>

        {/* How It Works: matching + notifications */}
        <section>
          <div className="flex flex-wrap items-center justify-center gap-8 flex-row">
            <div className="rounded-2xl shadow-lg overflow-hidden">
              <img
                src={volunteerImg2}
                alt="Volunteer matching interface"
                className="w-[500px] h-[350px]"
              />
            </div>
            <div className="flex flex-col items-center max-w-xs">
              <h2 className="text-xl font-semibold text-gray-700">
                💡 How It Works
              </h2>
              <p className="text-gray-600">
                Our smart matching system pairs volunteers with events based on skills,
                preferred dates, and city or neighborhood.
              </p>
              <p className="text-gray-600 mt-3">
                Once matched, volunteers receive clear notifications and updates about
                upcoming events, changes, and reminders, so no message or opportunity
                gets lost.
              </p>
            </div>
          </div>
        </section>

        {/* Volunteer History & Hours */}
        <section>
          <div className="flex flex-row items-center justify-center gap-8 flex-wrap">
            <div className="flex flex-col max-w-[425px]">
              <h2 className="text-2xl font-semibold text-gray-700">
                📊 Volunteer Hours & History
              </h2>

              <p className="text-gray-600 leading-relaxed mt-2">
                Houston Hearts keeps a complete record of each volunteer’s service — including
                events attended, roles performed, and hours contributed.
              </p>

              <p className="text-gray-600 leading-relaxed mt-3">
                Volunteers can quickly review their past events, track total hours, and build a
                trustworthy impact history that can be shared with schools, employers, or
                community organizations.
              </p>

              <p className="text-gray-600 leading-relaxed mt-3">
                After every event, your history is automatically updated, so you can focus on
                serving your community while we handle the tracking.
              </p>
            </div>
            <div className="rounded-2xl shadow-lg overflow-hidden">
              <img
                src={volunteerImg3}
                alt="Volunteer history and statistics"
                className="w-[500px] h-[350px]"
              />
            </div>
          </div>
        </section>

      </section>
    </Layout>
  );
}