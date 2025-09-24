import React from "react";

const FeatureCard = ({ icon, title, description }) => {
  return (
    <div className="feature-card bg-white p-6 rounded-lg shadow hover:shadow-lg transition duration-300">
      <div className="feature-icon text-4xl mb-4">{icon}</div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-blue-600">{description}</p>
    </div>
  );
};

export default FeatureCard;
