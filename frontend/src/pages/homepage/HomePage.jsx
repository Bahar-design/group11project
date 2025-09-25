import React, {useState} from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Footer from "../../components/footer.jsx";
import Header from "../../components/header.jsx";

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

export default function HomePage() {
    const [activeTab, setActiveTab] = useState("home");
  return (

    <div style={{ fontFamily: "'Inter', sans-serif" }}>
      <Header />


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
            <a
              href="#volunteer"
              className="btn btn-primary"
              style={{
                background: "linear-gradient(135deg, var(--primary-red), var(--accent-red))",
                color: "#fff",
                padding: "1rem 2rem",
                borderRadius: "12px",
                fontWeight: 600,
              }}
            >
              Join Us Today
            </a>
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


{/* Page Navigation Tabs */}
<div className="container mb-5">
  <div className="page-tabs">
    {[
      { label: " Homepage", id: "home" },
      { label: " Volunteer Portal", id: "volunteer" },
      { label: "Admin Hub", id: "admin" },
      { label: " Authentication", id: "login" },
    ].map((tab, idx) => (
      <button
        key={idx}
        className={`tab ${activeTab === tab.id ? "active" : ""}`}
        onClick={() => setActiveTab(tab.id)}
      >
        {tab.label}
      </button>
    ))}
  </div>
  
</div>


<div className="container my-5">
  {activeTab === "home" && (
    <div>
      <h2 className="mb-4 text-center" style={{ color: "var(--text-primary)" }}>
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
              <div className="card-body">
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
  )}

  {activeTab === "volunteer" && (
    <div>
      <h2 className="text-center">Volunteer Portal Content Here</h2>
      {/* Replace with real volunteer portal content */}
    </div>
  )}

  {activeTab === "admin" && (
    <div>
      <h2 className="text-center">Admin Hub Content Here</h2>
      {/* Replace with real admin content */}
    </div>
  )}
  {activeTab === "login" && (
  <section className="dashboard-section page-content active">
    <div className="container">
      <h2 className="section-title text-center">Join Our Community</h2>
      <p className="section-subtitle text-center mb-5">
        Sign in to start making a difference, or create your account to join Houston's most impactful volunteer network
      </p>

      {/* Login / Registration Forms */}
      <div className="login-forms">
        {/* Sign In Form */}
        <div className="form-card">
          <h3 className="form-title">Sign In</h3>
          <form>
            <div className="form-group">
              <label>Username or Email</label>
              <input type="text" className="form-input" placeholder="Enter your username" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-input" placeholder="Enter your password" />
            </div>
            <div className="d-flex justify-content-between align-items-center mb-3">
              <label className="d-flex align-items-center gap-2" style={{ fontSize: "0.9rem" }}>
                <input type="checkbox" className="skill-checkbox" />
                Remember me
              </label>
              <button href="#" style={{ color: "var(--primary-red)", textDecoration: "none", fontSize: "0.9rem" }}>
                Forgot password?
              </button>
            </div>
            <button type="submit" className="btn-primary w-100">
              Sign In 
            </button>
          </form>

          <div className="text-center mt-3 p-3" style={{ background: "var(--silver)", borderRadius: "12px" }}>
            <div style={{ fontWeight: 600, marginBottom: "0.5rem" }}>Demo Accounts</div>
            <div style={{ fontSize: "0.85rem", color: "var(--text-secondary)" }}>
              <strong>Admin:</strong> admin / admin123
              <br />
              <strong>Volunteer:</strong> volunteer1 / vol123
            </div>
          </div>
        </div>

        {/* Create Account Form */}
        <div className="form-card">
          <h3 className="form-title"> Create Account</h3>
          <form>
            <div className="form-group">
              <label>Full Name</label>
              <input type="text" className="form-input" placeholder="Enter your full name" />
            </div>
            <div className="form-group">
              <label>Email Address</label>
              <input type="email" className="form-input" placeholder="your@email.com" />
            </div>
            <div className="form-group">
              <label>Username</label>
              <input type="text" className="form-input" placeholder="Choose a username" />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input type="password" className="form-input" placeholder="Create a secure password" />
            </div>
            <div className="form-group">
              <label>Account Type</label>
              <select className="form-input">
                <option> Volunteer - Help families in need</option>
                <option> Administrator - Manage events and volunteers</option>
              </select>
            </div>
            <div className="mb-3">
              <label className="d-flex align-items-start gap-2" style={{ fontSize: "0.9rem", lineHeight: 1.4 }}>
                <input type="checkbox" className="skill-checkbox" style={{ marginTop: "0.2rem" }} />
                I agree to the Terms of Service and Privacy Policy, and I'm excited to start making a positive impact in Houston's community
              </label>
            </div>
            <button type="submit" className="btn-primary w-100">
              Create Account 
            </button>
          </form>

          <div className="text-center mt-2">
            <p style={{ fontSize: "0.9rem", color: "var(--text-secondary)" }}>
              After registration, complete your volunteer profile to get matched with perfect opportunities!
            </p>
          </div>

          {/* Skills Selection */}
          <div className="skills-grid mt-4">
            {[
              " Tailoring & Alterations",
              "Sewing & Stitching",
              "Customer Service",
              "Organization & Sorting",
              "Communication",
              "Bilingual (Spanish)",
              "Leadership & Training",
              "Computer & Data Entry",
              "Business & Admin",
              "Adaptability & Problem Solving",
            ].map((skill, idx) => (
              <div className="skill-item" key={idx}>
                <input type="checkbox" className="skill-checkbox" id={`skill-${idx}`} />
                <label htmlFor={`skill-${idx}`}>{skill}</label>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
)}


</div>

      {/* Call to Action */}
      <div
        className="py-5 text-center"
        style={{ background: "var(--warm-red)", color: "var(--text-primary)" }}
      >
        <h3 className="mb-3">Ready to Make an Impact?</h3>
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
      
      <Footer />

   


    </div>
    
  );
}
