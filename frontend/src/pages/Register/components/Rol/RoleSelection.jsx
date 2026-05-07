import React from "react";
import "./RoleSelection.css";

/**
 * RoleSelection Component
 * 
 * Provides a modern, premium UI for users to select their role during registration.
 * Offers two main paths: Gym Owner (Business) and Client (User).
 * 
 * @param {Object} props - Component properties
 * @param {Function} props.selectUserType - Function to call when a role is selected
 */
export const RoleSelection = ({ selectUserType }) => {
  return (
    <div className="role-selection-container">
      {/* Header section with title and subtitle */}
      <div className="role-selection-header">
        <h1 className="role-selection-title">Choose Your Path</h1>
        <p className="role-selection-subtitle">
          Select how you want to join the FitFlow ecosystem
        </p>
      </div>

      <div className="role-selection-grid">
        {/* GYM OWNER CARD: For business management */}
        <div 
          className="role-card role-card--dueno"
          onClick={() => selectUserType("DUENO")}
        >
          {/* Decorative glow effect for hover states */}
          <div className="role-card-glow"></div>
          
          <div className="role-card-content">
            <div className="role-icon-wrapper">
              <span className="material-symbols-outlined role-icon">business</span>
            </div>
            
            <h3 className="role-card-title">Gym Owner</h3>
            <p className="role-card-desc">
              Manage your branches, employees, classes, and the full economy of your business.
            </p>
            
            {/* Feature highlights for the Owner role */}
            <ul className="role-features">
              <li>
                <span className="material-symbols-outlined">check</span>
                Advanced control dashboard
              </li>
              <li>
                <span className="material-symbols-outlined">check</span>
                Multi-branch management
              </li>
              <li>
                <span className="material-symbols-outlined">check</span>
                Financial reporting & analytics
              </li>
            </ul>
            
            <div className="role-card-footer">
              <span className="role-badge premium-badge">Pro Plan</span>
              <button className="role-btn role-btn--dueno">
                Get Started <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>

        {/* CLIENT / USER CARD: For gym members */}
        <div 
          className="role-card role-card--usuario"
          onClick={() => selectUserType("USUARIO")}
        >
          <div className="role-card-glow"></div>
          
          <div className="role-card-content">
            <div className="role-icon-wrapper">
              <span className="material-symbols-outlined role-icon">fitness_center</span>
            </div>
            
            <h3 className="role-card-title">Client / User</h3>
            <p className="role-card-desc">
              Join your favorite gyms, book classes, and track your daily progress.
            </p>
            
            {/* Feature highlights for the Client role */}
            <ul className="role-features">
              <li>
                <span className="material-symbols-outlined">check</span>
                1-click class booking
              </li>
              <li>
                <span className="material-symbols-outlined">check</span>
                Multi-gym access
              </li>
              <li>
                <span className="material-symbols-outlined">check</span>
                Personal workout tracking
              </li>
            </ul>
            
            <div className="role-card-footer">
              <span className="role-badge free-badge">Free</span>
              <button className="role-btn role-btn--usuario">
                Get Started <span className="material-symbols-outlined">arrow_forward</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RoleSelection;
