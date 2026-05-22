import { useState } from "react";
import { passwordReset } from "../../api/auth.api";

/**
 * PasswordResetForm Component
 * 
 * Handles token input and new password submission for password reset.
 * Provides password strength validation and visibility toggle.
 * 
 * Props:
 * @param {string} tokenFromURL - Pre-filled token from URL query params
 * @param {Function} onResetSuccess - Callback when password is successfully reset
 */
const PasswordResetForm = ({ tokenFromURL, onResetSuccess }) => {
  const [token, setToken] = useState(tokenFromURL || "");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    // Validations
    if (!token) {
      setError("Por favor ingresa el código de recuperación");
      return;
    }

    if (!newPassword || newPassword.length < 8) {
      setError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    setLoading(true);

    try {
      const response = await passwordReset(token, newPassword);
      
      if (response.status === 200 || response.status === 201) {
        onResetSuccess();
      }
    } catch (err) {
      const errorMsg = 
        err.response?.data?.message || 
        err.message || 
        "Error al restablecer contraseña";
      setError(errorMsg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="password-reset-form-wrapper" onSubmit={handleSubmit}>
      {/* Global Error Messaging Area */}
      {error && (
        <div className="password-reset-error-container">
          <span className="material-symbols-outlined">error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Field Group: Recovery Token */}
      <div className="password-reset-field-group">
        <label className="password-reset-field-label">Código de Recuperación</label>
        <div className="password-reset-input-wrapper">
          <span className="material-symbols-outlined password-reset-input-icon">
            vpn_key
          </span>
          <input
            className="password-reset-input"
            placeholder="Ingresa el código recibido por correo"
            type="text"
            value={token}
            onChange={(e) => setToken(e.target.value.trim())}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Field Group: New Password */}
      <div className="password-reset-field-group">
        <label className="password-reset-field-label">Nueva Contraseña</label>
        <div className="password-reset-input-wrapper">
          <span className="material-symbols-outlined password-reset-input-icon">
            lock
          </span>
          <input
            className="password-reset-input"
            placeholder="Mínimo 8 caracteres"
            type={showPassword ? "text" : "password"}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            disabled={loading}
          />
        </div>
      </div>

      {/* Field Group: Confirm Password */}
      <div className="password-reset-field-group">
        <label className="password-reset-field-label">Confirmar Contraseña</label>
        <div className="password-reset-input-wrapper">
          <span className="material-symbols-outlined password-reset-input-icon">
            lock_outline
          </span>
          <input
            className="password-reset-input"
            placeholder="Repite tu nueva contraseña"
            type={showPassword ? "text" : "password"}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={loading}
          />
          {/* Toggle password visibility */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="password-reset-password-toggle"
          >
            <span className="material-symbols-outlined">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      {/* Primary Execution Action */}
      <button
        className="password-reset-submit-btn"
        type="submit"
        disabled={loading}
      >
        <span>
          {loading ? "Restableciendo..." : "Restablecer Contraseña"}
        </span>

        {!loading && (
          <span className="material-symbols-outlined password-reset-btn-icon">
            check_circle
          </span>
        )}
      </button>
    </form>
  );
};

export default PasswordResetForm;
