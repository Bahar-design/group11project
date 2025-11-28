import React, {useState} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Layout from "../../components/layout.jsx";
import logo from "../homepage/images/volunteer_1.png";
import secondPic from "../homepage/images/volunteerRed.png";
import { Link, useNavigate } from "react-router-dom";


const features = [
  {
    title: "Real-Time Opportunity Recommendations",
    description:
      "Our matchmaking engine suggests events based on your skills, location, and availability, helping you find the perfect opportunity without endless searching.",
  },
  {
    title: "Skill & Preference-Based Filtering",
    description:
      "Filter hundreds of community events by required skills, interests, and location. Find roles that fit your strengths, from customer service to leadership and more.",
  },
  {
    title: "Dynamic Event Management",
    description:
      "Organizers can easily create, update, and manage volunteer events. This includes locations, skill requirements, and urgency levels, all through an intuitive interface.",
  },
  {
    title: "Automated Notifications & Reminders",
    description:
      "Stay informed with instant notifications when you're assigned to an event, when details change, or when new opportunities open near you.",
  },
  {
    title: "Impact & Participation Tracking",
    description:
      "Track your history across all events participated in within the Volunteer History module and watch your impact grow over time.",
  },
  {
    title: "Multi-Location Support for Houston Communities",
    description:
      "Serving all of Houston and surrounding areas with event listings tailored to your local neighborhood, whether you're in Downtown, Sugar Land, Katy, Cypress, Galveston, etc.",
  },
];

export default function HomePage({ isLoggedIn, onLogout, user }) {
  const [activeTab, setActiveTab] = useState("home");
  const navigate = useNavigate();

  return (
  <Layout currentPage="home" isLoggedIn={isLoggedIn} onLogout={onLogout} user={user}>
      <div style={{ fontFamily: "'Inter', sans-serif" }}>
        {/* Hero Section */}
        <div
          className="text-center py-5"
          style={{
            background: "linear-gradient(135deg, var(--warm-bg), var(--silver), var(--warm-red))",
            position: "relative",
          }}
        >
          <div className="container">
            <h1
              style={{
                fontSize: "clamp(2.5rem, 5vw, 4rem)",
                fontWeight: 700,
                color: "var(--text-primary)",
                marginBottom: "1.5rem",
                lineHeight: 1.2,
              }}
            >
              Transform Lives,{" "}
              <span
                style={{
                  background: "linear-gradient(135deg, var(--primary-red), var(--accent-red))",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                }}
              >
                One Volunteer at a Time
              </span>
            </h1>
            <p
              style={{
                fontSize: "1.25rem",
                color: "var(--text-secondary)",
                maxWidth: "800px",
                margin: "0 auto 3rem",
                lineHeight: 1.7,
              }}
            >
              Join Houston Hearts and make a difference in our community through smart, flexible, and impactful volunteering opportunities.
            </p>
            <div className="d-flex justify-content-center gap-3 flex-wrap">
              <Link
                to="/register"
                className="btn btn-primary"
                style={{
                  background: "linear-gradient(135deg, var(--primary-red), var(--accent-red))",
                  color: "#fff",
                  padding: "1rem 2rem",
                  borderRadius: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Join Us Today
              </Link>
              <Link
                to="/about"
                className="btn btn-secondary"
                style={{
                  background: "#fff",
                  color: "var(--text-primary)",
                  border: "2px solid var(--medium-silver)",
                  padding: "1rem 2rem",
                  borderRadius: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                }}
              >
                Learn More
              </Link>
              < img  className="logo-img" src= {logo} alt="volunteer"/>
            </div>
          </div>
        </div>

        <div className="container my-5" style={{ backgroundColor: "white" }}>
          <div>
            <h2 className="mb-4 text-center" style={{ color: "var(--text-primary)", }}>
              How We Transform Lives
            </h2>
            <div className="row g-4">
              {features.map((f, idx) => (
                <div className="col-md-6 col-lg-4" key={idx}>
                  <div
                    className="card h-100"
                    style={{
                      boxShadow: "var(--shadow-soft)",
                      borderRadius: "12px",
                      padding: "1rem", 
                    }}
                  >
                    <div className="card-body" style={{ backgroundColor: "white" }}>
                      <h5 className="card-title" style={{ color: "var(--text-primary)" }}>
                        {f.title}
                      </h5>
                      <p className="card-text" style={{ color: "var(--text-secondary)" }}>
                        {f.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div
          className="py-5 text-center"
          style={{ background: "var(--warm-red)", color: "var(--text-primary)" }}
        >
          <h3 className="mb-3">Ready to Make an Impact?</h3>
          <img className="secondPic" src= {secondPic} alt="volunteer"/>
        </div>
      </div>
    </Layout>
  );
}
