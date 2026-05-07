import React from "react";
import "./Styles/InscriptionsModal.css";

/**
 * InscriptionsModal Component
 * 
 * Manages the enrollment list (attendance) for a specific class time slot.
 * Allows gym administrators to:
 * - View a list of members currently signed up for the session.
 * - Manually enroll new members from the gym's database.
 * - Remove members from the attendance list.
 * 
 * Props:
 * @param {boolean} open - Visibility state
 * @param {Function} onClose - Dismiss handler
 * @param {Object} selectedHorario - The specific time slot being managed
 * @param {string} clienteSelect - State for the selected client to enroll
 * @param {Function} setClienteSelect - State updater for client selection
 * @param {Array} todosLosClientes - Full list of gym members for search
 * @param {Function} handleInscribir - Enrollment submission handler
 * @param {Array} clientesInscritos - List of members currently in this session
 * @param {Function} handleDesinscribir - Removal handler
 */
export default function InscriptionsModal({
  open, onClose, selectedHorario, clienteSelect, setClienteSelect, todosLosClientes, handleInscribir, clientesInscritos, handleDesinscribir
}) {
  if (!open || !selectedHorario) return null;

  // Normalized member list for the selection dropdown
  const clientes = Array.isArray(todosLosClientes) ? todosLosClientes : todosLosClientes?.data || [];

  return (
    <div className="inscriptions-modal-overlay">
      <div className="inscriptions-modal-container">
        
        {/* Modal Header: Session context and close action */}
        <header className="inscriptions-modal-header">
          <div className="inscriptions-header-title">
            <span className="material-symbols-outlined" style={{color: "var(--secondary)"}}>group</span>
            <div>
              <h2>Attendance Management</h2>
              <p className="inscriptions-header-subtitle">
                {new Date(selectedHorario.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — Active Session Slot
              </p>
            </div>
          </div>
          <button className="inscriptions-modal-close" onClick={onClose} aria-label="Close modal">
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="inscriptions-modal-body">
          
          {/* List Section: Enrolled Members */}
          <div className="inscriptions-section">
            <h3 className="inscriptions-section-title">Current Participants ({clientesInscritos.length})</h3>
            
            <div className="inscriptions-list">
              {clientesInscritos.length > 0 ? (
                clientesInscritos.map((cli) => (
                  <div key={cli.id} className="inscription-card">
                    <div className="student-info">
                      <div className="student-avatar">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div className="student-name-group">
                        <h4>{cli.nombre} {cli.apellido}</h4>
                      </div>
                    </div>
                    <button 
                      className="student-remove-btn"
                      onClick={() => handleDesinscribir(cli.id)}
                      title="Unenroll member"
                    >
                      <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>person_remove</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="class-empty-state">
                  <p>No members are currently enrolled in this session.</p>
                </div>
              )}
            </div>
          </div>

          {/* Form Section: Manual Enrollment */}
          <div className="new-enrollment-form">
            <h3 className="inscriptions-section-title" style={{marginBottom: "0.5rem"}}>Quick Enrollment</h3>
            <div className="enrollment-inputs">
              <div className="select-wrapper">
                <select
                  className="horario-input horario-select"
                  style={{height: "3rem"}}
                  value={clienteSelect}
                  onChange={(e) => setClienteSelect(e.target.value)}
                >
                  <option value="">-- Search Registry --</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} {c.apellido} ({c.dni})</option>
                  ))}
                </select>
              </div>
              <button 
                className="btn-primary"
                style={{height: "3rem", padding: "0 1.5rem", background: "var(--secondary)", color: "#003924"}}
                onClick={handleInscribir}
                disabled={!clienteSelect}
              >
                Enroll Member
              </button>
            </div>
          </div>

        </div>

        {/* Footer: Session status and exit */}
        <footer className="inscriptions-modal-footer">
          <div className="status-badge-group">
            <span className="status-label">Slot Status</span>
            <div className="status-value">
              <span className="status-dot"></span>
              <span className="status-text">Open for Enrollment</span>
            </div>
          </div>
          <button 
            className="btn-secondary"
            style={{height: "2.75rem", padding: "0 2rem", background: "transparent"}}
            onClick={onClose}
          >
            Finished
          </button>
        </footer>

      </div>
    </div>
  );
}
