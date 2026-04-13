import { Link } from "react-router-dom";
import "./Styles/LoginForm.css";
import React from "react";

const LoginForm = ({ form, loading, error, handleInputChange, handleSubmit }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <form className="login-form-wrapper" onSubmit={handleSubmit}>
      {/* Error Message */}
      {error && (
        <div className="login-error-container">
          <span className="material-symbols-outlined" style={{fontSize: "1rem"}}>error</span>
          <span>{error}</span>
        </div>
      )}

      {/* Field: Nombre */}
      <div className="login-field-group">
        <label className="login-field-label">Nombre</label>
        <div className="login-input-wrapper">
          <span className="material-symbols-outlined login-input-icon">person</span>
          <input
            className="login-input"
            placeholder="Tu nombre"
            type="text"
            value={form.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Field: Apellido */}
      <div className="login-field-group">
        <label className="login-field-label">Apellido</label>
        <div className="login-input-wrapper">
          <span className="material-symbols-outlined login-input-icon">badge</span>
          <input
            className="login-input"
            placeholder="Tu apellido"
            type="text"
            value={form.apellido}
            onChange={(e) => handleInputChange("apellido", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Field: Contraseña */}
      <div className="login-field-group">
        <div className="login-label-row">
          <label className="login-field-label">Contraseña</label>
          <a className="login-forgot-link" href="#">¿Olvidaste la clave?</a>
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

      {/* Primary Action */}
      <button
        className="login-submit-btn"
        type="submit"
        disabled={loading}
      >
        <span>
          {loading ? "Iniciando..." : "Entrar"}
        </span>

        {!loading && (
          <span className="material-symbols-outlined login-btn-icon">
            arrow_forward
          </span>
        )}
      </button>

      {/* Secondary Link */}
      <footer className="login-footer-nav">
        <p className="login-footer-text">
          ¿No tienes cuenta?
          <Link to="/register" className="login-signup-link">
            Crear una cuenta
          </Link>
        </p>
      </footer>
    </form>
  );
};

export default LoginForm;
