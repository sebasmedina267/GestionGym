import React from "react";
import "./Styles/HorarioFormModal.css";

// Localized days array for internal selection logic
const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

/**
 * HorarioFormModal Component
 * 
 * A specialized modal for creating or editing a class schedule entry.
 * Provides granular control over the day of the week and start/end times.
 * 
 * Props:
 * @param {boolean} open - Visibility state
 * @param {Function} onClose - Dismiss handler
 * @param {Object} horarioForm - Current form data state
 * @param {Function} setHorarioForm - State updater for form data
 * @param {Function} handleCreateOrUpdateHorario - Submission handler
 */
export default function HorarioFormModal({
  open, onClose, horarioForm, setHorarioForm, handleCreateOrUpdateHorario
}) {
  if (!open) return null;

  const isEdit = Boolean(horarioForm.id);

  return (
    <div className="horario-modal-overlay">
      <div className="horario-modal-container">
        
        {/* Modal Header: Displays action title and schedule icon */}
        <header className="horario-modal-header">
          <div className="horario-header-title">
            <span className="material-symbols-outlined" style={{color: "var(--primary)"}}>schedule</span>
            <h2>
              {isEdit ? "Edit Session Slot" : "New Schedule Entry"}
            </h2>
          </div>
          <button className="horario-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={handleCreateOrUpdateHorario}>
          <div className="horario-modal-body">
            
            {/* Day Selection Field */}
            <div className="horario-field-group">
              <label className="horario-field-label">Target Day</label>
              <select
                className="horario-input horario-select"
                value={horarioForm.dia}
                onChange={(e) => setHorarioForm({ ...horarioForm, dia: parseInt(e.target.value) })}
              >
                {DAYS.map((dia, idx) => (
                  <option key={idx} value={idx}>{dia}</option>
                ))}
              </select>
            </div>

            {/* Time Configuration Grid */}
            <div className="horario-time-row">
              {/* Start Time Picker */}
              <div className="horario-field-group">
                <label className="horario-field-label" style={{color: "var(--primary)"}}>Session Start</label>
                <div className="time-inputs-group">
                  <input
                    className="horario-input"
                    style={{textAlign: "center"}}
                    type="number" min="0" max="23"
                    value={horarioForm.hora_inicio}
                    onChange={(e) => setHorarioForm({ ...horarioForm, hora_inicio: parseInt(e.target.value) })}
                    title="Hour"
                  />
                  <span className="time-sep">:</span>
                  <input
                    className="horario-input"
                    style={{textAlign: "center"}}
                    type="number" min="0" max="59"
                    value={horarioForm.minuto_inicio}
                    onChange={(e) => setHorarioForm({ ...horarioForm, minuto_inicio: parseInt(e.target.value) })}
                    title="Minute"
                  />
                </div>
              </div>

              {/* End Time Picker */}
              <div className="horario-field-group">
                <label className="horario-field-label" style={{color: "var(--secondary)"}}>Session End</label>
                <div className="time-inputs-group">
                  <input
                    className="horario-input"
                    style={{textAlign: "center"}}
                    type="number" min="0" max="23"
                    value={horarioForm.hora_fin}
                    onChange={(e) => setHorarioForm({ ...horarioForm, hora_fin: parseInt(e.target.value) })}
                    title="Hour"
                  />
                  <span className="time-sep">:</span>
                  <input
                    className="horario-input"
                    style={{textAlign: "center"}}
                    type="number" min="0" max="59"
                    value={horarioForm.minuto_fin}
                    onChange={(e) => setHorarioForm({ ...horarioForm, minuto_fin: parseInt(e.target.value) })}
                    title="Minute"
                  />
                </div>
              </div>
            </div>
            
            {/* Contextual User Guidance */}
            <p className="horario-info-note">
              <span className="material-symbols-outlined" style={{fontSize: "0.875rem", color: "var(--primary)"}}>info</span>
              Ensure the session timing does not overlap with existing entries for the same class definition.
            </p>
          </div>

          {/* Action Footer */}
          <footer className="horario-modal-footer">
            <button 
              className="btn-secondary"
              style={{height: "2.75rem", padding: "0 1.5rem", background: "transparent"}}
              type="button" 
              onClick={onClose}
            >
              Cancel
            </button>
            <button 
              className="btn-primary"
              style={{height: "2.75rem", padding: "0 2rem"}}
              type="submit"
            >
              <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>check_circle</span>
              {isEdit ? "Update Schedule" : "Confirm Entry"}
            </button>
          </footer>
        </form>

      </div>
    </div>
  );
}
