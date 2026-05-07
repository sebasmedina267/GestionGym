import React from "react";
import "../Styles/RegisterSteps.css";

/**
 * Step2UsuarioData Component
 * 
 * Handles the second step of registration for regular Users/Clients.
 * Collects additional demographic information and handles legal consent.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.formData - State object containing form values
 * @param {Object} props.errors - State object containing validation errors
 * @param {boolean} props.loading - Indicates if registration is in progress
 * @param {Function} props.handleInputChange - Updates specific fields in formData
 * @param {Function} props.nextStepSpecific - Finalizes registration for the user
 */
export const Step2UsuarioData = ({
  formData,
  errors,
  loading,
  handleInputChange,
  nextStepSpecific,
}) => {
  return (
    <div className="register-step-container">
      {/* Header section for additional info step */}
      <div className="register-step-header">
        <h2 className="register-step-title">Información Adicional</h2>
        <p className="register-step-subtitle">
          Ayúdanos a personalizar tu experiencia de fitness
        </p>
      </div>

      <form className="register-step-form register-form-simple">
        <div className="register-form-row">
          {/* Date of Birth Collection */}
          <div className="register-field-group">
            <label className="register-field-label">FECHA DE NACIMIENTO</label>
            <div className="register-input-container">
              <span className="material-symbols-outlined register-input-icon">
                cake
              </span>
              <input
                className={`register-input ${
                  errors.fechaNacimiento ? "register-input--error" : ""
                }`}
                type="date"
                value={formData.fechaNacimiento}
                onChange={(e) => handleInputChange("fechaNacimiento", e.target.value)}
                required
              />
            </div>
            {errors.fechaNacimiento && (
              <p className="register-error-text">{errors.fechaNacimiento}</p>
            )}
          </div>

          {/* Gender Identity (Optional field) */}
          <div className="register-field-group">
            <label className="register-field-label">GÉNERO (Opcional)</label>
            <div className="register-input-container">
              <span className="material-symbols-outlined register-input-icon">
                wc
              </span>
              <select
                className="register-select"
                value={formData.sexo}
                onChange={(e) => handleInputChange("sexo", e.target.value)}
              >
                <option value="">Seleccionar...</option>
                <option value="M">Masculino</option>
                <option value="F">Femenino</option>
                <option value="O">Otro</option>
                <option value="N">Prefiero no decirlo</option>
              </select>
              <span className="material-symbols-outlined register-select-arrow">
                expand_more
              </span>
            </div>
          </div>
        </div>

        {/* Legal Consent Section (Terms & Privacy Policy) */}
        <div className="register-terms-box">
          <label className="register-checkbox">
            <input
              type="checkbox"
              required
              onChange={(e) => handleInputChange("acceptTerms", e.target.checked)}
            />
            <span>
              Acepto los{" "}
              <a href="#" className="register-link">
                Términos y Condiciones
              </a>
              {" "}y la{" "}
              <a href="#" className="register-link">
                Política de Privacidad
              </a>
            </span>
          </label>
          {errors.acceptTerms && (
            <p className="register-error-text">{errors.acceptTerms}</p>
          )}
        </div>

        {/* Final Registration Action for Client role */}
        <button
          type="button"
          className="register-submit-btn register-btn-large"
          onClick={nextStepSpecific}
          disabled={loading}
        >
          {loading ? (
            <>
              <div className="register-spinner"></div>
              <span>Registrando...</span>
            </>
          ) : (
            <>
              <span className="material-symbols-outlined">check_circle</span>
              <span>Completar Registro</span>
            </>
          )}
        </button>
      </form>
    </div>
  );
};

export default Step2UsuarioData;
