import React from "react";
import HorarioCalendar from "../../components/ui/HorarioCalendar";
import StatsComponents from "./StatsComponents";
import "./Styles/ClassDetailModal.css";

/**
 * ClassDetailModal Component
 * 
 * A high-fidelity, multi-tab modal for in-depth class management.
 * Provides specialized views for:
 * - Weekly Schedules: Managing specific time slots.
 * - Staffing: Assigning and removing instructors.
 * - Subscription Plans: Defining pricing strategies and tiers.
 * - Performance Analytics: Visualizing demographic and participation data.
 * 
 * Props:
 * @param {boolean} open - Visibility toggle
 * @param {Function} onClose - Dismisses the modal
 * @param {Object} selectedClase - The core class definition being managed
 * @param {string} activeTab - The currently visible management module
 * @param {Function} setActiveTab - Switches between management modules
 * ...and various specialized handlers for sub-flows.
 */
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
      <div className="kinetic-modal w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in shadow-2xl">

        {/* --- Modal Header: Branding and Core Actions --- */}
        <header className="class-detail-header">
          <div className="class-header-info">
            <div className="class-header-icon">
              <span className="material-symbols-outlined" style={{fontSize: "1.875rem"}}>fitness_center</span>
            </div>
            <div className="class-title-group">
              <h2>{selectedClase.nombre}</h2>
              <p className="class-subtitle">Advanced Session Orchestration</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {/* Quick action to edit the primary class definition */}
            <button
              className="kinetic-btn kinetic-btn--ghost h-10 px-4"
              onClick={() => {
                setForm({ nombre: selectedClase.nombre, descripcion: selectedClase.descripcion || "" });
                setShowClaseModal(true);
              }}
            >
              <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>edit</span>
              Edit Profile
            </button>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all border border-white/10"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        {/* --- Module Navigation Tabs --- */}
        <nav className="class-tabs-nav">
          <div className="class-tabs-list">
            {[
              { id: "horarios", label: "Schedules", icon: "schedule" },
              { id: "monitores", label: "Staffing", icon: "badge" },
              { id: "precios", label: "Subscription Plans", icon: "payments" },
              { id: "stats", label: "Performance Metrics", icon: "analytics" },
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

        {/* --- Main Management Body (Dynamic Tab Content) --- */}
        <div className="kinetic-modal-body flex-1 overflow-y-auto px-8 py-6">

          {/* Module: Schedule Management */}
          {activeTab === "horarios" && (
            <div className="animate-fade-in" style={{display: "flex", flexDirection: "column", gap: "2rem"}}>
              <div className="class-section-header">
                <h3 className="class-section-title">
                  <span className="class-section-accent" style={{background: "var(--primary)"}} />
                  Weekly Time Slots
                </h3>
                <button
                  className="kinetic-btn kinetic-btn--secondary h-10 px-6"
                  onClick={() => {
                    setHorarioForm({ id: null, dia: 0, hora_inicio: 8, minuto_inicio: 0, hora_fin: 9, minuto_fin: 0 });
                    setShowHorarioModal(true);
                  }}
                >
                  <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>add</span>
                  Add Session
                </button>
              </div>

              <div className="class-grid-cards">
                {horarios.length > 0 ? (
                  horarios.map((h) => (
                    <div key={h.id} className="class-item-card">
                      <div className="class-info-main">
                        <p>
                          {["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][(new Date(h.inicio).getDay() + 6) % 7]}
                        </p>
                        <h4>
                          {new Date(h.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(h.fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </h4>
                        <div className="class-card-badges">
                          <span className="class-badge">
                            <span className="material-symbols-outlined" style={{fontSize: "0.75rem"}}>group</span>
                            Open Enrollment
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        {/* Access enrollment list for this specific session */}
                        <button
                          className="kinetic-btn kinetic-btn--secondary h-9 text-xs"
                          onClick={() => openInscripciones(h)}
                        >
                          Attendance
                        </button>
                        <button
                          className="kinetic-btn kinetic-btn--ghost h-9 text-xs"
                          onClick={() => openEditHorario(h)}
                        >
                          Edit Slot
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="class-empty-state">
                    <p>No active time slots defined for this class definition.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module: Staffing & Instructor Management */}
          {activeTab === "monitores" && (
            <div className="animate-fade-in" style={{display: "flex", flexDirection: "column", gap: "2rem"}}>
              <div className="class-section-header">
                <h3 className="class-section-title">
                  <span className="class-section-accent" style={{background: "var(--secondary)"}} />
                  Assigned Instructors
                </h3>
                <button
                  className="kinetic-btn kinetic-btn--secondary h-10 px-6"
                  onClick={() => setShowMonitorModal(true)}
                >
                  <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>person_add</span>
                  Link Staff
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
                          <h4>{m.nombre} {m.apellido}</h4>
                          <p className="monitor-label">Elite Certified Instructor</p>
                        </div>
                      </div>
                      <button
                        className="w-10 h-10 rounded-xl border border-error/20 text-error hover:bg-error/10 transition-colors flex items-center justify-center"
                        onClick={() => handleRemoverMonitor(m.id)}
                        title="Remove Assignment"
                      >
                        <span className="material-symbols-outlined" style={{fontSize: "1.25rem"}}>person_remove</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="class-empty-state">
                    <p>No instructors are currently linked to this class type.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module: Subscription & Pricing Strategy */}
          {activeTab === "precios" && (
            <div className="animate-fade-in" style={{display: "flex", flexDirection: "column", gap: "2rem"}}>
              <div className="class-section-header">
                <h3 className="class-section-title">
                  <span className="class-section-accent" style={{background: "#ff5c72"}} />
                  Active Membership Tiers
                </h3>
                <button
                  className="kinetic-btn kinetic-btn--secondary h-10 px-6"
                  onClick={() => {
                    setPrecioForm({ id: null, nombre: "", tipo_unidad: "MES", cantidad_unidad: 1, precio: "" });
                    setShowPrecioModal(true);
                  }}
                >
                  <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>add_card</span>
                  New Plan
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
                      <div className="flex flex-col gap-2">
                        <button
                          className="kinetic-btn kinetic-btn--ghost h-9 text-xs"
                          onClick={() => openEditPrecio(p)}
                        >
                          Modify
                        </button>
                        <button
                          className="kinetic-btn kinetic-btn--ghost h-9 text-xs text-error border-error/20 hover:bg-error/10"
                          onClick={() => handleEliminarPrecio(p.id)}
                        >
                          Archive
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="class-empty-state">
                    <p>No pricing strategies have been defined for this service.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Module: Performance Data Visualization */}
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

        {/* --- Modal Footer: Metadata and Close --- */}
        <footer className="class-detail-footer">
          <div className="footer-meta">
            <p className="footer-label">Registry Identifier</p>
            <p className="footer-value">CLS-{selectedClase.id.toString().padStart(4, '0')}</p>
          </div>
          <button
            className="kinetic-btn kinetic-btn--ghost h-11 px-8"
            onClick={onClose}
          >
            Exit Class Manager
          </button>
        </footer>

      </div>
    </div>
  );
}
