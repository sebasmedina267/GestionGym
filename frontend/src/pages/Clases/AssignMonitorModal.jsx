import React from "react";

export default function AssignMonitorModal({
  open, onClose, selectedMonitor, setSelectedMonitor, adminsData, handleAgregarMonitor
}) {
  if (!open) return null;

  const admins = Array.isArray(adminsData) ? adminsData : adminsData?.data || [];

  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center p-4 bg-[#0b1326]/90 backdrop-blur-md">
      <div className="kinetic-modal w-full max-w-md animate-fade-in shadow-2xl">
        
        <header className="kinetic-modal-header">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">person_add</span>
            <h2 className="text-xl font-bold text-on-surface">Vincular Monitor</h2>
          </div>
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="kinetic-modal-body space-y-6">
          <div className="space-y-4">
            <p className="text-sm text-on-surface-variant px-1 font-medium">
              Seleccione un miembro del staff para asignarlo como monitor de esta clase.
            </p>
            
            <div className="space-y-2">
              <label className="kinetic-label tracking-widest block px-1">Seleccionar Monitor</label>
              <select
                className="kinetic-input kinetic-select"
                value={selectedMonitor}
                onChange={(e) => setSelectedMonitor(e.target.value)}
              >
                <option value="">-- Escoger del Staff --</option>
                {admins.map((a) => (
                  <option key={a.id} value={a.id}>{a.nombre} ({a.rol})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="glass-card bg-secondary/5 border border-secondary/10 p-4 rounded-xl flex items-center gap-4">
            <div className="w-10 h-10 rounded-full bg-secondary/20 flex items-center justify-center text-secondary">
              <span className="material-symbols-outlined text-xl">verified_user</span>
            </div>
            <p className="text-[10px] font-bold text-on-surface-variant uppercase tracking-widest leading-relaxed">
              El monitor tendrá acceso a la lista de alumnos e inscripciones de esta sesión.
            </p>
          </div>
        </div>

        <footer className="kinetic-modal-footer">
          <button 
            className="kinetic-btn kinetic-btn--ghost h-11 px-6"
            onClick={onClose}
          >
            Cancelar
          </button>
          <button 
            className="kinetic-btn kinetic-btn--secondary h-11 px-8"
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
