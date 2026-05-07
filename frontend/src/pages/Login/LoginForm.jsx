import { Link } from "react-router-dom";
import "./Styles/LoginForm.css";
import React from "react";

/**
 * LoginForm Component
 * 
 * Handles the user input for authentication. 
 * Provides visual feedback for errors, loading states, and password visibility toggles.
 * 
 * Props:
 * @param {Object} form - State containing 'email' and 'password'
 * @param {boolean} loading - Indicates if an auth request is in progress
 * @param {string} error - Error message to display if login fails
 * @param {Function} handleInputChange - Callback to update form state
 * @param {Function} handleSubmit - Callback to execute the login process
 */
const LoginForm = ({ form, loading, error, handleInputChange, handleSubmit }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <form className="login-form-wrapper" onSubmit={handleSubmit}>
      
      {/* Global Error Messaging Area */}
      {error && (
        <div className="login-error-container">
          <span className="material-symbols-outlined" style={{fontSize: "1rem"}}>error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Field Group: Email Address */}
      <div className="login-field-group">
        <label className="login-field-label">Correo Electrónico</label>
        <div className="login-input-wrapper">
          <span className="material-symbols-outlined login-input-icon">mail</span>
          <input
            className="login-input"
            placeholder="you@example.com"
            type="email"
            value={form.email}
            onChange={(e) => handleInputChange("email", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Field Group: Secure Password */}
      <div className="login-field-group">
        <div className="login-label-row">
          <label className="login-field-label">Contraseña</label>
          {/* External link for password recovery flow */}
          <a className="login-forgot-link" href="#">¿Olvidaste tu contraseña?</a>
        </div>

        <div className="login-input-wrapper">
          <span className="material-symbols-outlined login-input-icon">lock</span>
          <input
            className="login-input"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            required
          />
          {/* Interactive toggle to peek at the password */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="login-input-password-toggle"
          >
            <span className="material-symbols-outlined" style={{fontSize: "1.25rem"}}>
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      {/* Primary Execution Action */}
      <button
        className="login-submit-btn"
        type="submit"
        disabled={loading}
      >
        <span>
          {loading ? "Autenticando..." : "Iniciar Sesión"}
        </span>

        {!loading && (
          <span className="material-symbols-outlined login-btn-icon">
            arrow_forward
          </span>
        )}
      </button>

      {/* Navigation Footer for New Users */}
      <footer className="login-footer-nav">
        <p className="login-footer-text">
          ¿Aún no tienes una cuenta? 
          <Link to="/register" className="login-signup-link">
             Únete a la plataforma
          </Link>
        </p>
      </footer>
    </form>
  );
};

export default LoginForm;
