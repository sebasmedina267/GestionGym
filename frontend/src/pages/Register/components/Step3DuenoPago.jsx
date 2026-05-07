import React, { useState } from "react";
import "../Styles/RegisterSteps.css";
import "../Styles/Step3Pago.css";

/**
 * Step3DuenoPago Component
 * 
 * Final registration step for Gym Owners. Displays a summary of the 
 * account and gym details, shows the subscription price, and 
 * provides the entry point to Stripe checkout.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.formData - All collected registration data
 * @param {boolean} props.loading - Indicates if the payment session is being created
 * @param {Function} props.processDuenoPayment - Triggers the Stripe redirect/modal
 * @param {Function} props.goBack - Navigates to the previous step
 */
export const Step3DuenoPago = ({
  formData,
  loading,
  processDuenoPayment,
  goBack,
}) => {
  // Local state for mandatory legal acceptance before paying
  const [acceptTerms, setAcceptTerms] = useState(false);
  
  return (
    <div className="pago-wrapper">
      {/* Header section with summary title */}
      <div className="pago-header">
        <h2 className="pago-title">Revisión y Pago</h2>
        <p className="pago-subtitle">Paso 3 de 3</p>
      </div>

      {/* Summary of Personal Contact Data */}
      <div className="pago-section">
        <p className="pago-section-label">
          <span className="material-symbols-outlined pago-label-icon">person</span>
          DATOS PERSONALES
        </p>
        <div className="pago-row">
          <span className="pago-row-key">Nombre</span>
          <span className="pago-row-val">{formData.nombre} {formData.apellido}</span>
        </div>
        <div className="pago-row">
          <span className="pago-row-key">Email</span>
          <span className="pago-row-val pago-email">{formData.email}</span>
        </div>
      </div>

      {/* Summary of Gyms/Branches being registered */}
      <div className="pago-section">
        <p className="pago-section-label">
          <span className="material-symbols-outlined pago-label-icon">fitness_center</span>
          GIMNASIOS / SUCURSALES
        </p>
        {formData.gyms.map((gym, i) => (
          <div key={i} className="pago-gym-row">
            <div className="pago-gym-avatar">
              <span className="material-symbols-outlined">fitness_center</span>
            </div>
            <div className="pago-gym-info">
              <span className="pago-gym-name">{gym.nombre || `Gimnasio ${i + 1}`}</span>
              {(gym.ciudad || gym.calle) && (
                <span className="pago-gym-addr">
                  <span className="material-symbols-outlined" style={{ fontSize: "13px" }}>location_on</span>
                  {gym.ciudad}{gym.calle ? `, ${gym.calle}` : ""}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Price Breakdown and Total Calculation */}
      <div className="pago-price-card">
        <div className="pago-price-row">
          <span className="pago-price-label">Suscripción Anual</span>
          <span className="pago-price-amt">$99.00</span>
        </div>
        <div className="pago-price-row">
          <span className="pago-price-label">Sucursales Adicionales</span>
          <span className="pago-price-free">Gratis</span>
        </div>
        <div className="pago-price-divider" />
        <div className="pago-price-row pago-price-total-row">
          <span className="pago-price-total-label">Total</span>
          <div className="pago-price-total-block">
            <span className="pago-price-total-amt">$99.00</span>
            <span className="pago-price-total-period">USD/AÑO</span>
          </div>
        </div>
      </div>

      {/* Payment Method Preview */}
      <div className="pago-method-selector">
        <span className="material-symbols-outlined pago-method-icon">credit_card</span>
        <span className="pago-method-label">Tarjeta o Billetera Digital (Stripe)</span>
        <div className="pago-method-badges">
          <span className="pago-card-badge pago-card-visa">VISA</span>
          <span className="pago-card-badge pago-card-mc">MC</span>
        </div>
      </div>

      {/* Security indicators to build trust */}
      <div className="pago-security-row">
        <div className="pago-security-item">
          <span className="material-symbols-outlined">lock</span>
          <span>Seguro</span>
        </div>
        <div className="pago-security-item">
          <span className="material-symbols-outlined">verified_user</span>
          <span>Encriptación SSL</span>
        </div>
      </div>

      {/* Terms and Privacy Policy acceptance */}
      <label className="pago-terms">
        <input
          type="checkbox"
          checked={acceptTerms}
          onChange={(e) => setAcceptTerms(e.target.checked)}
        />
        <span>
          He leído y acepto los{" "}
          <a href="#" className="pago-link">Términos y Condiciones</a>{" "}
          y la{" "}
          <a href="#" className="pago-link">Política de Privacidad</a>.
        </span>
      </label>

      {/* Main Payment Trigger: Redirects to Stripe Checkout */}
      <button
        className="pago-pay-btn"
        onClick={processDuenoPayment}
        disabled={loading || !acceptTerms}
      >
        {loading ? (
          <>
            <div className="register-spinner" />
            <span>Preparando pago...</span>
          </>
        ) : (
          <>
            <span>PAGAR $99.00</span>
            <span className="material-symbols-outlined">arrow_forward</span>
          </>
        )}
      </button>

      {/* Footer disclaimer */}
      <p className="pago-footer-note">PAGO SEGURO PROCESADO POR STRIPE</p>
    </div>
  );
};

export default Step3DuenoPago;
