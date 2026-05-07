import React, { useState } from "react";
import "../Styles/RegisterSteps.css";

/**
 * Step1PersonalData Component
 * 
 * Handles the first step of registration: collecting basic personal information
 * such as name, email, and password.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.formData - State object containing form values
 * @param {Object} props.errors - State object containing validation errors
 * @param {boolean} props.loading - Indicates if a validation/submission is in progress
 * @param {Function} props.handleInputChange - Function to update formData state
 * @param {Function} props.nextStepPersonal - Function to transition to the next step
 * @param {string} props.userType - The type of user (DUENO or USUARIO)
 */
export const Step1PersonalData = ({
  formData,
  errors,
  loading,
  handleInputChange,
  nextStepPersonal,
  userType,
}) => {
  // Local state for toggling password visibility
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  return (
    <div className="register-step-container">
      {/* Dynamic header based on user type */}
      <div className="register-step-header">
        <h2 className="register-step-title">
          {userType === "DUENO" ? "Crear Cuenta de Administrador" : "Crear Cuenta"}
        </h2>
        <p className="register-step-subtitle">
          {userType === "DUENO"
            ? "Configura tu centro de gestión y credenciales"
            : "Completa tus datos para acceder a la plataforma"}
        </p>
      </div>

      <form className="register-step-form register-form-simple">
        {/* Full Name Section (First & Last Name) */}
        <div className="register-form-row">
          <div className="register-field-group">
            <label className="register-field-label">NOMBRE</label>
            <div className="register-input-container">
              <span className="material-symbols-outlined register-input-icon">
                person
              </span>
              <input
                className={`register-input ${
                  errors.nombre ? "register-input--error" : ""
                }`}
                placeholder="Ej. Alex"
                type="text"
                value={formData.nombre}
                onChange={(e) => handleInputChange("nombre", e.target.value)}
                required
              />
            </div>
            {errors.nombre && (
              <p className="register-error-text">{errors.nombre}</p>
            )}
          </div>

          <div className="register-field-group">
            <label className="register-field-label">APELLIDO</label>
            <div className="register-input-container">
              <span className="material-symbols-outlined register-input-icon">
                person
              </span>
              <input
                className={`register-input ${
                  errors.apellido ? "register-input--error" : ""
                }`}
                placeholder="Ej. Sterling"
                type="text"
                value={formData.apellido}
                onChange={(e) => handleInputChange("apellido", e.target.value)}
                required
              />
            </div>
            {errors.apellido && (
              <p className="register-error-text">{errors.apellido}</p>
            )}
          </div>
        </div>

        {/* Email Address Section */}
        <div className="register-field-group">
          <label className="register-field-label">CORREO ELECTRÓNICO</label>
          <div className="register-input-container">
            <span className="material-symbols-outlined register-input-icon">
              mail
            </span>
            <input
              className={`register-input ${
                errors.email ? "register-input--error" : ""
              }`}
              placeholder="email@ejemplo.com"
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              required
            />
          </div>
          {errors.email && (
            <p className="register-error-text">{errors.email}</p>
          )}
        </div>

        {/* Password Security Section (Password & Confirmation) */}
        <div className="register-form-row">
          <div className="register-field-group">
            <label className="register-field-label">CONTRASEÑA</label>
            <div className="register-input-container">
              <span className="material-symbols-outlined register-input-icon">
                lock
              </span>
              <input
                className={`register-input ${
                  errors.password ? "register-input--error" : ""
                }`}
                placeholder="••••••••"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                required
              />
              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowPassword(!showPassword)}
              >
                <span className="material-symbols-outlined">
                  {showPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.password && (
              <p className="register-error-text">{errors.password}</p>
            )}
          </div>

          <div className="register-field-group">
            <label className="register-field-label">CONFIRMAR CONTRASEÑA</label>
            <div className="register-input-container">
              <span className="material-symbols-outlined register-input-icon">
                lock
              </span>
              <input
                className={`register-input ${
                  errors.confirmPassword ? "register-input--error" : ""
                }`}
                placeholder="••••••••"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
                required
              />
              <button
                type="button"
                className="register-password-toggle"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                <span className="material-symbols-outlined">
                  {showConfirmPassword ? "visibility_off" : "visibility"}
                </span>
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="register-error-text">{errors.confirmPassword}</p>
            )}
          </div>
        </div>

        {/* Security guidelines for passwords */}
        <p className="register-pwd-requirement">
          Requisitos: 8+ caracteres, 1 mayúscula, 1 número, 1 símbolo
        </p>

        {/* Action Button: Transitions to the next step after validation */}
        <button
          type="button"
          className="register-submit-btn register-btn-large"
          onClick={nextStepPersonal}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="register-spinner"></div>
              <span>Validando...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">arrow_forward</span>
              <span>Continuar</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Step1PersonalData;
