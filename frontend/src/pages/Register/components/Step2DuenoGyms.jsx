import React from "react";
import "../Styles/RegisterSteps.css";

/**
 * Step2DuenoGyms Component
 * 
 * Handles the second step of registration for Gym Owners.
 * Allows the owner to add one or more gyms/branches with their respective locations.
 * 
 * @param {Object} props - Component properties
 * @param {Object} props.formData - State object containing form values (including gyms array)
 * @param {Object} props.errors - State object containing validation errors
 * @param {boolean} props.loading - Indicates if validation/submission is in progress
 * @param {Function} props.handleGymChange - Updates specific gym data within the array
 * @param {Function} props.addGym - Adds a new empty gym object to the list
 * @param {Function} props.removeGym - Removes a gym object from the list by index
 * @param {Function} props.nextStepSpecific - Function to transition to the next step
 */
export const Step2DuenoGyms = ({
  formData,
  errors,
  loading,
  handleGymChange,
  addGym,
  removeGym,
  nextStepSpecific,
}) => {
  return (
    <div className="register-step-container">
      {/* Step introduction header */}
      <div className="register-step-header">
        <h2 className="register-step-title">Información del Gimnasio</h2>
        <p className="register-step-subtitle">
          Introduce los detalles de tu(s) gimnasio(s) o sucursal(es)
        </p>
      </div>

      <form className="register-step-form register-form-simple">
        {/* Rendered list of gyms to be registered */}
        <div className="register-gyms-list">
          {formData.gyms.map((gym, index) => (
            <div key={index} className="register-gym-card-simple">
              <div className="register-form-row">
                {/* Gym Business Name */}
                <div className="register-field-group">
                  <label className="register-field-label">
                    NOMBRE DEL GIMNASIO
                  </label>
                  <div className="register-input-container">
                    <span className="material-symbols-outlined register-input-icon">
                      fitness_center
                    </span>
                    <input
                      className={`register-input ${
                        errors.gym ? "register-input--error" : ""
                      }`}
                      placeholder="Ej. Iron Haven HQ"
                      type="text"
                      value={gym.nombre}
                      onChange={(e) =>
                        handleGymChange(index, "nombre", e.target.value)
                      }
                      required
                    />
                  </div>
                </div>

                {/* Access Level (Locked to Owner for this flow) */}
                <div className="register-field-group">
                  <label className="register-field-label">NIVEL DE ACCESO</label>
                  <div className="register-input-container">
                    <span className="material-symbols-outlined register-input-icon">
                      admin_panel_settings
                    </span>
                    <select className="register-select">
                      <option value="DUENO">Dueño</option>
                    </select>
                    <span className="material-symbols-outlined register-select-arrow">
                      expand_more
                    </span>
                  </div>
                </div>
              </div>

              {/* Physical Street Address */}
              <div className="register-form-row">
                <div className="register-field-group">
                  <label className="register-field-label">DIRECCIÓN</label>
                  <div className="register-input-container">
                    <span className="material-symbols-outlined register-input-icon">
                      location_on
                    </span>
                    <input
                      className={`register-input ${errors.calle ? "register-input--error" : ""}`}
                      placeholder="Calle y número"
                      type="text"
                      value={gym.calle}
                      onChange={(e) =>
                        handleGymChange(index, "calle", e.target.value)
                      }
                      required
                    />
                  </div>
                  {index === 0 && errors.calle && <p className="register-error-text">{errors.calle}</p>}
                </div>
              </div>

              <div className="register-form-row">
                {/* City Location */}
                <div className="register-field-group">
                  <label className="register-field-label">CIUDAD</label>
                  <div className="register-input-container">
                    <span className="material-symbols-outlined register-input-icon">
                      location_city
                    </span>
                    <input
                      className={`register-input ${errors.ciudad ? "register-input--error" : ""}`}
                      placeholder="Ciudad"
                      type="text"
                      value={gym.ciudad}
                      onChange={(e) =>
                        handleGymChange(index, "ciudad", e.target.value)
                      }
                      required
                    />
                  </div>
                  {index === 0 && errors.ciudad && <p className="register-error-text">{errors.ciudad}</p>}
                </div>

                {/* State / Province (Optional) */}
                <div className="register-field-group">
                  <label className="register-field-label">ESTADO / PROVINCIA (Opcional)</label>
                  <div className="register-input-container">
                    <span className="material-symbols-outlined register-input-icon">
                      map
                    </span>
                    <input
                      className="register-input"
                      placeholder="Provincia"
                      type="text"
                      value={gym.provincia}
                      onChange={(e) =>
                        handleGymChange(index, "provincia", e.target.value)
                      }
                    />
                  </div>
                </div>
              </div>

              {/* Remove Gym Action: Only available if there's more than one gym entry */}
              {formData.gyms.length > 1 && (
                <button
                  type="button"
                  className="register-remove-gym-btn"
                  onClick={() => removeGym(index)}
                >
                  <span className="material-symbols-outlined">delete</span>
                  Eliminar Gimnasio
                </button>
              )}
            </div>
          ))}
        </div>

        {/* Global validation error box for gym section */}
        {errors.gym && (
          <div className="register-error-box">
            <span className="material-symbols-outlined">error</span>
            <p>{errors.gym}</p>
          </div>
        )}

        {/* Add Another Gym Action: Capped at a maximum of 5 for initial registration */}
        {formData.gyms.length < 5 && (
          <button
            type="button"
            className="register-add-gym-btn-simple"
            onClick={addGym}
          >
            <span className="material-symbols-outlined">add</span>
            <span>Añadir otra sucursal</span>
          </button>
        )}

        {/* Transition to the next step (e.g., Payment) */}
        <button
          type="button"
          className="register-submit-btn register-btn-large"
          onClick={nextStepSpecific}
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

export default Step2DuenoGyms;
