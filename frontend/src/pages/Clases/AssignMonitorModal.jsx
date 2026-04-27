import React from "react";
import "./Styles/AssignMonitorModal.css";

export default function AssignMonitorModal({
  open, onClose, selectedMonitor, setSelectedMonitor, adminsData, handleAgregarMonitor
}) {
  if (!open) return null;

  const admins = Array.isArray(adminsData) ? adminsData : adminsData?.data || [];

  return (
    <div className="assign-modal-overlay">
      <div className="assign-modal-container">
        
        <header className="assign-modal-header">
          <div className="assign-header-title">
            <span className="material-symbols-outlined" style={{color: "var(--secondary)"}}>person_add</span>
            <h2>Vincular Monitor</h2>
          </div>
          <button className="assign-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="assign-modal-body">
          <p className="assign-info-text">
            Seleccione un miembro del staff para asignarlo como monitor de esta clase.
          </p>
          
          <div className="create-field-group">
            <label className="create-field-label">Seleccionar Monitor</label>
            <select
              className="horario-input horario-select"
              value={selectedMonitor}
              onChange={(e) => setSelectedMonitor(e.target.value)}
            >
              <option value="">-- Escoger del Staff --</option>
              {admins.map((a) => (
                <option key={a.id} value={a.id}>{a.nombre} ({a.rol})</option>
              ))}
            </select>
          </div>

          <div className="assign-info-card">
            <div className="info-card-icon">
              <span className="material-symbols-outlined">verified_user</span>
            </div>
            <p className="info-card-text">
              El monitor tendrá acceso a la lista de alumnos e inscripciones de esta sesión.
            </p>
          </div>
        </div>

        <footer className="assign-modal-footer">
          <button 
            className="btn-secondary"
            style={{height: "2.75rem", padding: "0 1.5rem", background: "transparent"}}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="btn-primary"
            style={{height: "2.75rem", padding: "0 2rem", background: "var(--secondary)", color: "#003924"}}
            onClick={handleAgregarMonitor}
            disabled={!selectedMonitor}
          >
            Confirmar Vínculo
          </button>
        </footer>

      </div>
    </div>
  );
}
