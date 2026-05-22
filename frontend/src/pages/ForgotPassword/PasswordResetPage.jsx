import { useNavigate, useSearchParams } from "react-router-dom";
import { useState } from "react";
import PasswordResetForm from "./PasswordResetForm";
import "./Styles/PasswordResetPage.css";

/**
 * PasswordResetPage Component
 * 
 * Page where users can reset their password using a reset token.
 * Can be accessed via email link (with token in query param) or manually entering the token.
 */
export default function PasswordResetPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const tokenFromURL = searchParams.get("token");
  const [resetSuccess, setResetSuccess] = useState(false);

  const handleResetSuccess = () => {
    setResetSuccess(true);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  return (
    <div className="password-reset-page">
      <div className="password-reset-container">
        <div className="password-reset-card">
          {!resetSuccess ? (
            <>
              <div className="password-reset-header">
                <h1>Restablecer Contraseña</h1>
                <p>
                  Ingresa el código de recuperación que recibiste por correo y tu nueva contraseña.
                </p>
              </div>
              <PasswordResetForm
                tokenFromURL={tokenFromURL}
                onResetSuccess={handleResetSuccess}
              />
              <div className="password-reset-footer">
                <p>
                  ¿Aún no tienes un código?{" "}
                  <button
                    type="button"
                    className="password-reset-link"
                    onClick={() => navigate("/forgot-password")}
                  >
                    Solicitar uno
                  </button>
                </p>
              </div>
            </>
          ) : (
            <div className="password-reset-success">
              <div className="success-icon">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <h2>Contraseña Actualizada</h2>
              <p>
                Tu contraseña ha sido restablecida exitosamente.
              </p>
              <p className="success-instruction">
                Ya puedes iniciar sesión con tu nueva contraseña.
              </p>
              <button
                type="button"
                className="password-reset-login-btn"
                onClick={handleBackToLogin}
              >
                Ir al Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
