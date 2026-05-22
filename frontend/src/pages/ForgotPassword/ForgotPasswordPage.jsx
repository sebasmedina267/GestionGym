import { useNavigate } from "react-router-dom";
import { useState } from "react";
import ForgotPasswordForm from "./ForgotPasswordForm";
import "./Styles/ForgotPasswordPage.css";

/**
 * ForgotPasswordPage Component
 * 
 * Landing page for users who need to recover their password.
 * Handles the initial request step where users enter their email.
 */
export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const [submitted, setSubmitted] = useState(false);
  const [email, setEmail] = useState("");

  const handleSubmitSuccess = (userEmail) => {
    setEmail(userEmail);
    setSubmitted(true);
  };

  const handleBackToLogin = () => {
    navigate("/login");
  };

  const handleGoToReset = () => {
    navigate("/reset-password");
  };

  return (
    <div className="forgot-password-page">
      <div className="forgot-password-container">
        <div className="forgot-password-card">
          {!submitted ? (
            <>
              <div className="forgot-password-header">
                <h1>Recuperar Contraseña</h1>
                <p>
                  Ingresa tu correo electrónico y te enviaremos un enlace para restablecer tu contraseña.
                </p>
              </div>
              <ForgotPasswordForm onSubmitSuccess={handleSubmitSuccess} />
              <div className="forgot-password-footer">
                <p>
                  ¿Recuerdas tu contraseña?{" "}
                  <button
                    type="button"
                    className="forgot-password-link"
                    onClick={handleBackToLogin}
                  >
                    Volver al Login
                  </button>
                </p>
              </div>
            </>
          ) : (
            <div className="forgot-password-success">
              <div className="success-icon">
                <span className="material-symbols-outlined">check_circle</span>
              </div>
              <h2>Correo Enviado</h2>
              <p>
                Hemos enviado un enlace de recuperación a <strong>{email}</strong>
              </p>
              <p className="success-instruction">
                Por favor revisa tu bandeja de entrada y haz clic en el enlace proporcionado.
              </p>
              <button
                type="button"
                className="forgot-password-reset-btn"
                onClick={handleGoToReset}
              >
                Tengo mi Token de Recuperación
              </button>
              <button
                type="button"
                className="forgot-password-back-btn"
                onClick={handleBackToLogin}
              >
                Volver al Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
