import { useState } from "react";
import { passwordResetRequest } from "../../api/auth.api";

/**
 * ForgotPasswordForm Component
 * 
 * Handles the email input and submission for password reset request.
 * Provides real-time validation and error handling.
 * 
 * Props:
 * @param {Function} onSubmitSuccess - Callback when password reset request succeeds
 */
const ForgotPasswordForm = ({ onSubmitSuccess }) => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const response = await passwordResetRequest(email);
      
      if (response.status === 200 || response.status === 201) {
        onSubmitSuccess(email);
      }
    } catch (err) {
      const errorMsg = 
        err.response?.data?.message || 
        err.message || 
        "Error al solicitar recuperación de contraseña";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="forgot-password-form-wrapper" onSubmit={handleSubmit}>
      {/* Global Error Messaging Area */}
      {error && (
        <div className="forgot-password-error-container">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Field Group: Email Address */}
      <div className="forgot-password-field-group">
        <label className="forgot-password-field-label">Correo Electrónico</label>
        <div className="forgot-password-input-wrapper">
          <span className="material-symbols-outlined forgot-password-input-icon">
            mail
          </span>
          <input
            className="forgot-password-input"
            placeholder="tu@ejemplo.com"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Primary Execution Action */}
      <button
        className="forgot-password-submit-btn"
        type="submit"
        disabled={loading}
      >
        <span>
          {loading ? "Enviando..." : "Enviar Enlace de Recuperación"}
        </span>

        {!loading && (
          <span className="material-symbols-outlined forgot-password-btn-icon">
            mail_outline
          </span>
        )}
      </button>
    </form>
  );
};

export default ForgotPasswordForm;
