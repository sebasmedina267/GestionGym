import React from "react";
import "./Styles/InscriptionsModal.css";
export default function InscriptionsModal({
  open, onClose, selectedHorario, clienteSelect, setClienteSelect, todosLosClientes, handleInscribir, clientesInscritos, handleDesinscribir
}) {
  if (!open || !selectedHorario) return null;

  const clientes = Array.isArray(todosLosClientes) ? todosLosClientes : todosLosClientes?.data || [];

  return (
    <div className="inscriptions-modal-overlay">
      <div className="inscriptions-modal-container">
        
        <header className="inscriptions-modal-header">
          <div className="inscriptions-header-title">
            <span className="material-symbols-outlined" style={{color: "var(--secondary)"}}>group</span>
            <div>
              <h2>Gestión de Alumnos</h2>
              <p className="inscriptions-header-subtitle">
                {new Date(selectedHorario.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — Slot Activo
              </p>
            </div>
          </div>
          <button className="inscriptions-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="inscriptions-modal-body">
          
          {/* Alumnos List */}
          <div className="inscriptions-section">
            <h3 className="inscriptions-section-title">Alumnos Inscritos ({clientesInscritos.length})</h3>
            
            <div className="inscriptions-list">
              {clientesInscritos.length > 0 ? (
                clientesInscritos.map((cli) => (
                  <div key={cli.id} className="inscription-card">
                    <div className="student-info">
                      <div className="student-avatar">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div className="student-name-group">
                        <h4>{cli.nombre}</h4>
                      </div>
                    </div>
                    <button 
                      className="student-remove-btn"
                      onClick={() => handleDesinscribir(cli.id)}
                    >
                      <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>person_remove</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="class-empty-state">
                  <p>No hay alumnos inscritos en este turno.</p>
                </div>
              )}
            </div>
          </div>

          {/* New Inscription */}
          <div className="new-enrollment-form">
            <h3 className="inscriptions-section-title" style={{marginBottom: "0.5rem"}}>Inscribir nuevo alumno</h3>
            <div className="enrollment-inputs">
              <div className="select-wrapper">
                <select
                  className="horario-input horario-select"
                  style={{height: "3rem"}}
                  value={clienteSelect}
                  onChange={(e) => setClienteSelect(e.target.value)}
                >
                  <option value="">-- Buscar Alumno --</option>
                  {clientes.map((c) => (
                    <option key={c.id} value={c.id}>{c.nombre} ({c.dni})</option>
                  ))}
                </select>
              </div>
              <button 
                className="btn-primary"
                style={{height: "3rem", padding: "0 1.5rem", background: "var(--secondary)", color: "#003924"}}
                onClick={handleInscribir}
                disabled={!clienteSelect}
              >
                Inscribir
              </button>
            </div>
          </div>

        </div>

        <footer className="inscriptions-modal-footer">
          <div className="status-badge-group">
            <span className="status-label">Estado</span>
            <div className="status-value">
              <span className="status-dot"></span>
              <span className="status-text">Turno Abierto</span>
            </div>
          </div>
          <button 
            className="btn-secondary"
            style={{height: "2.75rem", padding: "0 2rem", background: "transparent"}}
            onClick={onClose}
          >
            Finalizar
          </button>
        </footer>

      </div>
    </div>
  );
}
