import React from "react";
import { Link } from "react-router-dom";
import { useRegisterFlow } from "./useRegisterFlow";
import Step0SelectUserType from "./components/Step0SelectUserType";
import Step1PersonalData from "./components/Step1PersonalData";
import Step2DuenoGyms from "./components/Step2DuenoGyms";
import Step2UsuarioData from "./components/Step2UsuarioData";
import Step3DuenoPago from "./components/Step3DuenoPago";
import "./Styles/Register.css";
import "./Styles/RegisterSteps.css";

/**
 * RegisterPageNew Component
 * 
 * Main container for the multi-step registration flow of the FitFlow application.
 * Manages the rendering of different steps based on the current state of the 
 * registration process and the selected user type (Owner vs. Client).
 */
export default function RegisterPageNew() {
  // Extract all necessary state and handlers from the useRegisterFlow hook
  const {
    currentStep,
    userType,
    formData,
    errors,
    loading,
    success,
    error,
    selectUserType,
    nextStepPersonal,
    nextStepSpecific,
    processDuenoPayment,
    handleInputChange,
    handleGymChange,
    addGym,
    removeGym,
    goBack,
  } = useRegisterFlow();

  return (
    <div className="register-page-container">
      {/* Visual background elements to enhance the UI aesthetic */}
      <div className="register-ambient-glow-1"></div>
      <div className="register-ambient-glow-2"></div>
      <div className="register-texture-overlay"></div>

      {/* Main Registration Content Area */}
      <main className="register-main-content">
        {/* Semi-transparent Glassmorphism Container */}
        <section className="register-glass-card">
          {/* Contextual Navigation: Logic for returning to previous state */}
          <div className="register-nav-header">
            {currentStep === 0 ? (
              <Link to="/login" className="register-back-link">
                <span className="material-symbols-outlined">arrow_back</span>
                <span>Volver al Login</span>
              </Link>
            ) : (
              <button onClick={goBack} className="register-back-link-btn">
                <span className="material-symbols-outlined">arrow_back</span>
                <span>Volver</span>
              </button>
            )}
          </div>

          {/* Progress Indicator: Shows visual feedback of the user's progress through the steps */}
          {currentStep > 0 && userType && (
            <div className="register-progress">
              <div className="register-progress-bar">
                <div
                  className="register-progress-fill"
                  style={{
                    width: `${
                      userType === "DUENO"
                        ? (currentStep / 3) * 100
                        : (currentStep / 2) * 100
                    }%`,
                  }}
                ></div>
              </div>
              <p className="register-progress-text">
                Paso {currentStep} de {userType === "DUENO" ? 3 : 2}
              </p>
            </div>
          )}

          {/* Error Banner: Displays server-side or global validation errors */}
          {error && (
            <div className="register-error-banner">
              <span className="material-symbols-outlined">error</span>
              <p>{error}</p>
            </div>
          )}

          {/* Success Banner: Displays confirmation messages after successful actions */}
          {success && (
            <div className="register-success-banner">
              <span className="material-symbols-outlined">check_circle</span>
              <p>{success}</p>
            </div>
          )}

          {/* Step 0: Initial Selector - User chooses between Owner and Client roles */}
          {currentStep === 0 && (
            <Step0SelectUserType selectUserType={selectUserType} />
          )}

          {/* Step 1: Personal Data - Core credentials shared by all user types */}
          {currentStep === 1 && userType && (
            <Step1PersonalData
              formData={formData}
              errors={errors}
              loading={loading}
              handleInputChange={handleInputChange}
              nextStepPersonal={nextStepPersonal}
              userType={userType}
            />
          )}

          {/* Step 2 (Owner): Gym Setup - Configuration of business branches */}
          {currentStep === 2 && userType === "DUENO" && (
            <Step2DuenoGyms
              formData={formData}
              errors={errors}
              loading={loading}
              handleGymChange={handleGymChange}
              addGym={addGym}
              removeGym={removeGym}
              nextStepSpecific={nextStepSpecific}
            />
          )}

          {/* Step 2 (Client): Profile Data - Additional information for regular users */}
          {currentStep === 2 && userType === "USUARIO" && (
            <Step2UsuarioData
              formData={formData}
              errors={errors}
              loading={loading}
              handleInputChange={handleInputChange}
              nextStepSpecific={nextStepSpecific}
            />
          )}

          {/* Step 3 (Owner): Payment - Review and Stripe checkout initiation */}
          {currentStep === 3 && userType === "DUENO" && (
            <Step3DuenoPago
              formData={formData}
              loading={loading}
              processDuenoPayment={processDuenoPayment}
              goBack={goBack}
            />
          )}

          {/* Final Success View: Displayed after successful Client registration */}
          {currentStep === 2.5 && (
            <div className="register-success-screen">
              <div className="register-success-icon">
                <span className="material-symbols-outlined">
                  check_circle
                </span>
              </div>
              <h2 className="register-success-title">¡Registro Exitoso!</h2>
              <p className="register-success-message">
                Tu cuenta está lista. Redirigiéndote al login...
              </p>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
