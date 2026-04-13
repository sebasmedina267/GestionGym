import React from "react";
import HorarioCalendar from "../../components/ui/HorarioCalendar";
import StatsComponents from "./StatsComponents";
import "./Styles/ClassDetailModal.css";

export default function ClassDetailModal({
  open, onClose, selectedClase,
  activeTab, setActiveTab,
  setForm, setShowClaseModal,
  horarios, setHorarioForm, setShowHorarioModal,
  openInscripciones, openEditHorario,
  selectedHorario,
  monitores, setSelectedMonitor, setShowMonitorModal, handleRemoverMonitor,
  precios, setPrecioForm, setShowPrecioModal, openEditPrecio, handleEliminarPrecio,
  stats, generoData, edadData
}) {
  if (!open || !selectedClase) return null;

  return (
    <div className="class-detail-overlay">
      <div className="class-detail-container">
        
        {/* Header */}
        <header className="class-detail-header">
          <div className="class-header-info">
            <div className="class-header-icon">
              <span className="material-symbols-outlined" style={{fontSize: "1.875rem"}}>fitness_center</span>
            </div>
            <div className="class-title-group">
              <h2>{selectedClase.nombre}</h2>
              <p className="class-subtitle">Gestión avanzada de sesión</p>
            </div>
          </div>
          <div className="class-header-actions">
            <button 
              className="btn-secondary" 
              style={{height: "2.5rem", padding: "0 1rem"}}
              onClick={() => {
                setForm({ nombre: selectedClase.nombre, descripcion: selectedClase.descripcion || "" });
                setShowClaseModal(true);
              }}
            >
              <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>edit</span>
              Editar Info
            </button>
            <button className="class-modal-close" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        {/* Tabs navigation */}
        <nav className="class-tabs-nav">
          <div className="class-tabs-list">
            {[
              { id: "horarios", label: "Horarios", icon: "schedule" },
              { id: "monitores", label: "Monitores", icon: "badge" },
              { id: "precios", label: "Planes", icon: "payments" },
              { id: "stats", label: "Estadísticas", icon: "analytics" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`class-tab ${activeTab === tab.id ? "class-tab-active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Body */}
        <div className="class-modal-body">
          
          {activeTab === "horarios" && (
            <div className="animate-fade-in" style={{display: "flex", flexDirection: "column", gap: "2rem"}}>
              <div className="class-section-header">
                <h3 className="class-section-title">
                  <span className="class-section-accent" style={{background: "var(--primary)"}} />
                  Turnos de la clase
                </h3>
                <button 
                  className="btn-primary"
                  style={{height: "2.5rem", padding: "0 1.5rem"}}
                  onClick={() => {
                    setHorarioForm({ id: null, dia: 0, hora_inicio: 8, minuto_inicio: 0, hora_fin: 9, minuto_fin: 0 });
                    setShowHorarioModal(true);
                  }}
                >
                  <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>add</span>
                  Añadir Horario
                </button>
              </div>

              <div className="class-grid-cards">
                {horarios.length > 0 ? (
                  horarios.map((h) => (
                    <div key={h.id} className="class-item-card">
                      <div className="class-info-main">
                        <p>
                          {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][(new Date(h.inicio).getDay() + 6) % 7]}
                        </p>
                        <h4>
                          {new Date(h.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(h.fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </h4>
                        <div className="class-card-badges">
                          <span className="class-badge">
                            <span className="material-symbols-outlined" style={{fontSize: "0.75rem"}}>group</span>
                            Slots disponibles
                          </span>
                        </div>
                      </div>
                      <div className="class-card-actions">
                        <button 
                          className="btn-secondary"
                          style={{height: "2.25rem", fontSize: "0.75rem"}}
                          onClick={() => openInscripciones(h)}
                        >
                          Alumnos
                        </button>
                        <button 
                          className="btn-secondary"
                          style={{height: "2.25rem", fontSize: "0.75rem", background: "transparent"}}
                          onClick={() => openEditHorario(h)}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="class-empty-state">
                    <p>Aún no hay horarios definidos para esta clase.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "monitores" && (
            <div className="animate-fade-in" style={{display: "flex", flexDirection: "column", gap: "2rem"}}>
              <div className="class-section-header">
                <h3 className="class-section-title">
                  <span className="class-section-accent" style={{background: "var(--secondary)"}} />
                  Staff asignado
                </h3>
                <button 
                  className="btn-primary"
                  style={{height: "2.5rem", padding: "0 1.5rem", background: "var(--secondary)", color: "#003924"}}
                  onClick={() => setShowMonitorModal(true)}
                >
                  <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>person_add</span>
                  Vincular Monitor
                </button>
              </div>

              <div className="monitores-list">
                {monitores.length > 0 ? (
                  monitores.map((m) => (
                    <div key={m.id} className="monitor-card">
                      <div className="monitor-info">
                        <div className="monitor-avatar">
                          <span className="material-symbols-outlined" style={{fontSize: "1.5rem"}}>account_circle</span>
                        </div>
                        <div className="monitor-name-group">
                          <h4>{m.nombre}</h4>
                          <p className="monitor-label">Instructor Elite</p>
                        </div>
                      </div>
                      <button 
                        className="monitor-remove-btn"
                        onClick={() => handleRemoverMonitor(m.id)}
                      >
                        <span className="material-symbols-outlined" style={{fontSize: "1.25rem"}}>person_remove</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="class-empty-state">
                    <p>No hay monitores vinculados a esta clase.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "precios" && (
            <div className="animate-fade-in" style={{display: "flex", flexDirection: "column", gap: "2rem"}}>
              <div className="class-section-header">
                <h3 className="class-section-title">
                  <span className="class-section-accent" style={{background: "#ff5c72"}} />
                  Planes de suscripción
                </h3>
                <button 
                  className="btn-primary"
                  style={{height: "2.5rem", padding: "0 1.5rem"}}
                  onClick={() => {
                    setPrecioForm({ id: null, nombre: "", tipo_unidad: "MES", cantidad_unidad: 1, precio: "" });
                    setShowPrecioModal(true);
                  }}
                >
                  <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>add_card</span>
                  Nuevo Plan
                </button>
              </div>

              <div className="planes-list">
                {precios.length > 0 ? (
                  precios.map((p) => (
                    <div key={p.id} className="plan-card">
                      <div>
                        <h4>{p.nombre}</h4>
                        <div className="plan-price-group">
                          <span className="plan-price">{p.precio}€</span>
                          <span className="plan-period">/ {p.cantidad_unidad} {p.tipo_unidad}</span>
                        </div>
                      </div>
                      <div className="class-card-actions">
                        <button 
                          className="btn-secondary"
                          style={{height: "2.25rem", fontSize: "0.75rem", background: "transparent"}}
                          onClick={() => openEditPrecio(p)}
                        >
                          Editar
                        </button>
                        <button 
                          className="btn-danger"
                          style={{height: "2.25rem", fontSize: "0.75rem"}}
                          onClick={() => handleEliminarPrecio(p.id)}
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="class-empty-state">
                    <p>No se han definido planes de precio aún.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "stats" && (
            <div className="animate-fade-in">
              <StatsComponents 
                stats={stats} 
                generoData={generoData} 
                edadData={edadData} 
              />
            </div>
          )}

        </div>

        {/* Footer */}
        <footer className="class-detail-footer">
          <div className="footer-meta">
            <p className="footer-label">ID de Sesión</p>
            <p className="footer-value">CLS-{selectedClase.id.toString().padStart(4, '0')}</p>
          </div>
          <button 
            className="btn-secondary"
            style={{height: "2.75rem", padding: "0 2rem", background: "transparent"}}
            onClick={onClose}
          >
            Cerrar Gestión
          </button>
        </footer>

      </div>
    </div>
  );
}
