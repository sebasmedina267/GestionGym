import React from "react";
import "../Styles/RegisterSteps.css";

export const Step0SelectUserType = ({ selectUserType }) => {
  return (
    <div className="register-step-container">
      <div className="register-step-header">
        <h1 className="register-step-title">Bienvenido a FitFlow</h1>
        <p className="register-step-subtitle">
          Selecciona tu rol para continuar
        </p>
      </div>

      <div className="register-user-type-grid">
        {/* Opción DUEÑO */}
        <button
          className="register-user-type-card register-user-type-card--dueno"
          onClick={() => selectUserType("DUENO")}
        >
          <div className="register-user-type-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>
              business
            </span>
          </div>
          <h3 className="register-user-type-title">Dueño de Gimnasio</h3>
          <p className="register-user-type-description">
            Gestiona tu(s) gimnasio(s), empleados y finanzas
          </p>
          <div className="register-user-type-features">
            <div className="register-feature">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Dashboard de control</span>
            </div>
            <div className="register-feature">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Crear múltiples sucursales</span>
            </div>
            <div className="register-feature">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Gestión de empleados</span>
            </div>
            <div className="register-feature">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Reportes y análisis</span>
            </div>
          </div>
          <div className="register-user-type-badge">Plan: $99/año</div>
        </button>

        {/* Opción USUARIO */}
        <button
          className="register-user-type-card register-user-type-card--usuario"
          onClick={() => selectUserType("USUARIO")}
        >
          <div className="register-user-type-icon">
            <span className="material-symbols-outlined" style={{ fontSize: "2rem" }}>
              person
            </span>
          </div>
          <h3 className="register-user-type-title">Cliente/Usuario</h3>
          <p className="register-user-type-description">
            Acceso a la app de cliente para mis gimnasios
          </p>
          <div className="register-user-type-features">
            <div className="register-feature">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Ver clases disponibles</span>
            </div>
            <div className="register-feature">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Reservar entrenamientos</span>
            </div>
            <div className="register-feature">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Ver progreso personal</span>
            </div>
            <div className="register-feature">
              <span className="material-symbols-outlined">check_circle</span>
              <span>Acceso a todas las sedes</span>
            </div>
          </div>
          <div className="register-user-type-badge">Gratis</div>
        </button>
      </div>

      <div className="register-step-footer">
        <p className="register-login-link">
          ¿Ya tienes una cuenta? <a href="/login">Inicia sesión aquí</a>
        </p>
      </div>
    </div>
  );
};

export default Step0SelectUserType;
