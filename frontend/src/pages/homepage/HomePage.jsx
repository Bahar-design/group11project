import React, {useState} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Layout from "../../components/layout.jsx";
import logo from "../homepage/images/volunteer_1.png";
import secondPic from "../homepage/images/volunteerRed.png";
import { Link, useNavigate } from "react-router-dom";


const features = [
  {
    title: "Smart Matching System",
    description:
      "Our advanced algorithm matches volunteers with events based on skills, location within 20-50 mile radius, and availability to maximize impact and minimize travel time.",
  },
  {
    title: "Strategic Locations",
    description:
      "Serving Downtown Houston, Sugar Land, Katy, and Cypress with regular collection drives and emergency disaster response coordination.",
  },
  {
    title: "Flexible Scheduling",
    description:
      "Choose from morning (12-4pm) or afternoon (4-8pm) shifts that work with your schedule. Maximum 4-hour commitments respect your time.",
  },
  {
    title: "Skills-Based Volunteering",
    description:
      "Whether you excel in tailoring, customer service, organization, or leadership, we'll connect you with opportunities that utilize your unique talents.",
  },
  {
    title: "Performance Tracking",
    description:
      "Track your volunteer journey with performance ratings, attendance history, and impact metrics. See how your contribution makes a difference.",
  },
  {
    title: "Emergency Response",
    description:
      "Weather API integration for disaster assistance. Receive priority notifications when Houston families need urgent clothing support during emergencies.",
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
              <a
                href="#about"
                className="btn btn-secondary"
                style={{
                  background: "#fff",
                  color: "var(--text-primary)",
                  border: "2px solid var(--medium-silver)",
                  padding: "1rem 2rem",
                  borderRadius: "12px",
                  fontWeight: 600,
                }}
              >
                Learn More
              </a>
              < img  className="logo-img" src= {logo} alt="volunteer"/>
            </div>
          </div>
        </div>

        {/* Stats Section */}
        <section className="stats py-5">
          <div className="stats-container container d-flex flex-wrap justify-content-center gap-4">
            {[
              { number: "2,400+", label: "Families Helped" },
              { number: "85", label: "Active Volunteers" },
              { number: "12,000+", label: "Items Donated" },
              { number: "98%", label: "Satisfaction Rate" },
            ].map((stat, idx) => (
              <div key={idx} className="stat-card">
                <div className="stat-number">{stat.number}</div>
                <div className="stat-label">{stat.label}</div>
              </div>
            ))}
          </div>
        </section>

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
          <button
            href="#volunteer"
            className="btn btn-primary btn-lg"
            style={{
              background: "linear-gradient(135deg, var(--primary-red), var(--accent-red))",
              color: "#fff",
              padding: "1rem 2rem",
              borderRadius: "12px",
              fontWeight: 600,
            }}
          >
            Join Us Today
          </button>
        </div>
      </div>
    </Layout>
  );
}
