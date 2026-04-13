import React from "react";
import "./Styles/HorarioFormModal.css";
const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function HorarioFormModal({
  open, onClose, horarioForm, setHorarioForm, handleCreateOrUpdateHorario
}) {
  if (!open) return null;

  const isEdit = Boolean(horarioForm.id);

  return (
    <div className="horario-modal-overlay">
      <div className="horario-modal-container">
        
        <header className="horario-modal-header">
          <div className="horario-header-title">
            <span className="material-symbols-outlined" style={{color: "var(--primary)"}}>schedule</span>
            <h2>
              {isEdit ? "Editar Horario" : "Nuevo Turno"}
            </h2>
          </div>
          <button className="horario-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={handleCreateOrUpdateHorario}>
          <div className="horario-modal-body">
            <div className="horario-field-group">
              <label className="horario-field-label">Día de la semana</label>
              <select
                className="horario-input horario-select"
                value={horarioForm.dia}
                onChange={(e) => setHorarioForm({ ...horarioForm, dia: parseInt(e.target.value) })}
              >
                {DIAS.map((dia, idx) => (
                  <option key={idx} value={idx}>{dia}</option>
                ))}
              </select>
            </div>

            <div className="horario-time-row">
              <div className="horario-field-group">
                <label className="horario-field-label" style={{color: "var(--primary)"}}>Inicio</label>
                <div className="time-inputs-group">
                  <input
                    className="horario-input"
                    style={{textAlign: "center"}}
                    type="number" min="0" max="23"
                    value={horarioForm.hora_inicio}
                    onChange={(e) => setHorarioForm({ ...horarioForm, hora_inicio: parseInt(e.target.value) })}
                  />
                  <span className="time-sep">:</span>
                  <input
                    className="horario-input"
                    style={{textAlign: "center"}}
                    type="number" min="0" max="59"
                    value={horarioForm.minuto_inicio}
                    onChange={(e) => setHorarioForm({ ...horarioForm, minuto_inicio: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="horario-field-group">
                <label className="horario-field-label" style={{color: "var(--secondary)"}}>Fin</label>
                <div className="time-inputs-group">
                  <input
                    className="horario-input"
                    style={{textAlign: "center"}}
                    type="number" min="0" max="23"
                    value={horarioForm.hora_fin}
                    onChange={(e) => setHorarioForm({ ...horarioForm, hora_fin: parseInt(e.target.value) })}
                  />
                  <span className="time-sep">:</span>
                  <input
                    className="horario-input"
                    style={{textAlign: "center"}}
                    type="number" min="0" max="59"
                    value={horarioForm.minuto_fin}
                    onChange={(e) => setHorarioForm({ ...horarioForm, minuto_fin: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            
            <p className="horario-info-note">
              <span className="material-symbols-outlined" style={{fontSize: "0.875rem", color: "var(--primary)"}}>info</span>
              Asegúrese de que el horario no colisione con otros turnos de la misma clase.
            </p>
          </div>

          <footer className="horario-modal-footer">
            <button 
              className="btn-secondary"
              style={{height: "2.75rem", padding: "0 1.5rem", background: "transparent"}}
              type="button" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary"
              style={{height: "2.75rem", padding: "0 2rem"}}
              type="submit"
            >
              <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>check_circle</span>
              {isEdit ? "Guardar Cambios" : "Añadir Horario"}
            </button>
          </footer>
        </form>

      </div>
    </div>
  );
}
