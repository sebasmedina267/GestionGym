import React from "react";

export default function InscriptionsModal({
  open, onClose, selectedHorario, clienteSelect, setClienteSelect, todosLosClientes, handleInscribir, clientesInscritos, handleDesinscribir
}) {
  if (!open || !selectedHorario) return null;

  const clientes = Array.isArray(todosLosClientes) ? todosLosClientes : todosLosClientes?.data || [];

  return (
    <div className="fixed inset-0 z-150 flex items-center justify-center p-4 bg-[#0b1326]/95 backdrop-blur-xl">
      <div className="kinetic-modal w-full max-w-2xl animate-fade-in shadow-2xl overflow-hidden flex flex-col max-h-[85vh]">
        
        <header className="kinetic-modal-header bg-white/5">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-secondary">group</span>
            <div>
              <h2 className="text-xl font-bold text-on-surface">Gestión de Alumnos</h2>
              <p className="text-[10px] font-black uppercase tracking-widest text-on-surface-variant leading-none mt-1">
                {new Date(selectedHorario.inicio).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} — Slot Activo
              </p>
            </div>
          </div>
          <button 
            className="w-10 h-10 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <div className="kinetic-modal-body flex-1 overflow-y-auto space-y-8">
          
          {/* Alumnos List */}
          <div className="space-y-4">
            <h3 className="kinetic-label tracking-widest px-1">Alumnos Inscritos ({clientesInscritos.length})</h3>
            
            <div className="space-y-2">
              {clientesInscritos.length > 0 ? (
                clientesInscritos.map((cli) => (
                  <div key={cli.id} className="glass-card p-4 flex items-center justify-between border border-white/5 hover:border-white/10">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 rounded-full bg-white/5 border border-white/5 flex items-center justify-center text-on-surface-variant">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                      <div>
                        <h4 className="font-bold text-on-surface leading-none">{cli.nombre}</h4>
                        <p className="text-[10px] font-medium text-on-surface-variant mt-1.5 uppercase"></p>
                      </div>
                    </div>
                    <button 
                      className="w-9 h-9 rounded-lg border border-error/20 text-error hover:bg-error/10 transition-colors flex items-center justify-center"
                      onClick={() => handleDesinscribir(cli.id)}
                    >
                      <span className="material-symbols-outlined text-sm">person_remove</span>
                    </button>
                  </div>
                ))
              ) : (
                <div className="py-12 text-center border-2 border-dashed border-white/5 rounded-3xl">
                  <p className="text-on-surface-variant font-medium">No hay alumnos inscritos en este turno.</p>
                </div>
              )}
            </div>
          </div>

          {/* New Inscription */}
          <div className="bg-white/5 p-6 rounded-2xl space-y-4 border border-white/5">
            <h3 className="kinetic-label tracking-widest">Inscribir nuevo alumno</h3>
            <div className="flex gap-3">
              <div className="flex-1">
                <select
                  className="kinetic-input kinetic-select h-12"
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
                className="kinetic-btn kinetic-btn--secondary h-12 px-8"
                onClick={handleInscribir}
                disabled={!clienteSelect}
              >
                Inscribir
              </button>
            </div>
          </div>

        </div>

        <footer className="kinetic-modal-footer bg-white/5">
          <div className="mr-auto px-2">
            <span className="text-[10px] font-black uppercase text-secondary/60 tracking-widest">Estado</span>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-secondary shadow-[0_0_8px_rgba(78,222,163,0.5)]"></span>
              <span className="text-xs font-bold text-on-surface uppercase">Turno Abierto</span>
            </div>
          </div>
          <button 
            className="kinetic-btn kinetic-btn--ghost h-11 px-8"
            onClick={onClose}
          >
            Finalizar
          </button>
        </footer>

      </div>
    </div>
  );
}
