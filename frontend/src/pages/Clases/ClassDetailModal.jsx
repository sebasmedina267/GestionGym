import React from "react";
import HorarioCalendar from "../../components/ui/HorarioCalendar";
import StatsComponents from "./StatsComponents";

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
    <div className="fixed inset-0 z-100 flex items-center justify-center p-4 bg-[#0b1326]/80 backdrop-blur-md">
      <div className="kinetic-modal w-full max-w-5xl max-h-[90vh] flex flex-col overflow-hidden animate-fade-in shadow-2xl">

        {/* Header */}
        <header className="kinetic-modal-header py-6 px-8">
          <div className="flex items-center gap-6">
            <div className="w-14 h-14 rounded-2xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary">
              <span className="material-symbols-outlined text-3xl">fitness_center</span>
            </div>
            <div>
              <h2 className="text-2xl font-black text-on-surface tracking-tight leading-none mb-2">
                {selectedClase.nombre}
              </h2>
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bdc2ff]/60 leading-none">
                Gestión avanzada de sesión
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              className="kinetic-btn kinetic-btn--ghost h-10 px-4"
              onClick={() => {
                setForm({ nombre: selectedClase.nombre, descripcion: selectedClase.descripcion || "" });
                setShowClaseModal(true);
              }}
            >
              <span className="material-symbols-outlined text-lg">edit</span>
              Editar Info
            </button>
            <button
              className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10 transition-all border border-white/10"
              onClick={onClose}
            >
              <span className="material-symbols-outlined">close</span>
            </button>
          </div>
        </header>

        {/* Tabs navigation */}
        <nav className="px-8 mt-2">
          <div className="kinetic-tabs">
            {[
              { id: "horarios", label: "Horarios", icon: "schedule" },
              { id: "monitores", label: "Monitores", icon: "badge" },
              { id: "precios", label: "Planes", icon: "payments" },
              { id: "stats", label: "Estadísticas", icon: "analytics" },
            ].map((tab) => (
              <button
                key={tab.id}
                className={`kinetic-tab flex items-center gap-2 ${activeTab === tab.id ? "kinetic-tab--active" : ""}`}
                onClick={() => setActiveTab(tab.id)}
              >
                <span className="material-symbols-outlined text-lg">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>
        </nav>

        {/* Body */}
        <div className="kinetic-modal-body flex-1 overflow-y-auto px-8 py-6">

          {activeTab === "horarios" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="kinetic-section__title text-on-surface mb-0">
                  <span className="kinetic-section__accent bg-primary" />
                  Turnos de la clase
                </h3>
                <button
                  className="kinetic-btn kinetic-btn--secondary h-10 px-6"
                  onClick={() => {
                    setHorarioForm({ id: null, dia: 0, hora_inicio: 8, minuto_inicio: 0, hora_fin: 9, minuto_fin: 0 });
                    setShowHorarioModal(true);
                  }}
                >
                  <span className="material-symbols-outlined text-lg">add</span>
                  Añadir Horario
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {horarios.length > 0 ? (
                  horarios.map((h) => (
                    <div key={h.id} className="glass-card p-5 group flex items-center justify-between border border-white/5 hover:border-primary/20">
                      <div>
                        <p className="text-[10px] font-black uppercase text-primary/80 mb-1 tracking-widest">
                          {["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"][(new Date(h.inicio).getDay() + 6) % 7]}
                        </p>
                        <h4 className="text-lg font-bold text-on-surface">
                          {new Date(h.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} - {new Date(h.fin).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </h4>
                        <div className="mt-3 flex items-center gap-3">
                          <span className="bg-white/5 px-3 py-1 rounded-full text-[10px] font-bold text-on-surface-variant flex items-center gap-1">
                            <span className="material-symbols-outlined text-xs">group</span>
                            Slots disponibles
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          className="kinetic-btn kinetic-btn--secondary h-9 text-xs"
                          onClick={() => openInscripciones(h)}
                        >
                          Alumnos
                        </button>
                        <button
                          className="kinetic-btn kinetic-btn--ghost h-9 text-xs"
                          onClick={() => openEditHorario(h)}
                        >
                          Editar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-on-surface-variant font-medium">Aún no hay horarios definidos para esta clase.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "monitores" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="kinetic-section__title text-on-surface mb-0">
                  <span className="kinetic-section__accent bg-secondary" />
                  Staff asignado
                </h3>
                <button
                  className="kinetic-btn kinetic-btn--secondary h-10 px-6"
                  onClick={() => setShowMonitorModal(true)}
                >
                  <span className="material-symbols-outlined text-lg">person_add</span>
                  Vincular Monitor
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {monitores.length > 0 ? (
                  monitores.map((m) => (
                    <div key={m.id} className="glass-card p-5 group flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center text-on-surface-variant border border-white/5 group-hover:border-secondary/30 transition-colors">
                          <span className="material-symbols-outlined text-2xl">account_circle</span>
                        </div>
                        <div>
                          <h4 className="text-lg font-bold text-on-surface">{m.nombre}</h4>
                          <p className="text-[10px] font-black uppercase text-secondary/70 tracking-widest">Instructor Elite</p>
                        </div>
                      </div>
                      <button
                        className="w-10 h-10 rounded-xl border border-error/20 text-error hover:bg-error/10 transition-colors flex items-center justify-center"
                        onClick={() => handleRemoverMonitor(m.id)}
                      >
                        <span className="material-symbols-outlined text-xl">person_remove</span>
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-on-surface-variant font-medium">No hay monitores vinculados a esta clase.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {activeTab === "precios" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex justify-between items-center">
                <h3 className="kinetic-section__title text-on-surface mb-0">
                  <span className="kinetic-section__accent bg-[#ff5c72]" />
                  Planes de suscripción
                </h3>
                <button
                  className="kinetic-btn kinetic-btn--secondary h-10 px-6"
                  onClick={() => {
                    setPrecioForm({ id: null, nombre: "", tipo_unidad: "MES", cantidad_unidad: 1, precio: "" });
                    setShowPrecioModal(true);
                  }}
                >
                  <span className="material-symbols-outlined text-lg">add_card</span>
                  Nuevo Plan
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {precios.length > 0 ? (
                  precios.map((p) => (
                    <div key={p.id} className="glass-card p-5 group flex items-center justify-between border-l-4 border-l-[#ff5c72]">
                      <div>
                        <h4 className="text-lg font-bold text-on-surface">{p.nombre}</h4>
                        <div className="flex items-center gap-3 mt-1">
                          <span className="text-2xl font-black text-[#ff5c72]">{p.precio}€</span>
                          <span className="text-[10px] uppercase font-black text-on-surface-variant">/ {p.cantidad_unidad} {p.tipo_unidad}</span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <button
                          className="kinetic-btn kinetic-btn--ghost h-9 text-xs"
                          onClick={() => openEditPrecio(p)}
                        >
                          Editar
                        </button>
                        <button
                          className="kinetic-btn kinetic-btn--ghost h-9 text-xs text-error border-error/20 hover:bg-error/10"
                          onClick={() => handleEliminarPrecio(p.id)}
                        >
                          Borrar
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="col-span-full py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                    <p className="text-on-surface-variant font-medium">No se han definido planes de precio aún.</p>
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
        <footer className="kinetic-modal-footer bg-white/5">
          <div className="mr-auto">
            <p className="kinetic-label">ID de Sesión</p>
            <p className="text-xs font-bold text-on-surface-variant">CLS-{selectedClase.id.toString().padStart(4, '0')}</p>
          </div>
          <button
            className="kinetic-btn kinetic-btn--ghost h-11 px-8"
            onClick={onClose}
          >
            Cerrar Gestión
          </button>
        </footer>

      </div>
    </div>
  );
}
