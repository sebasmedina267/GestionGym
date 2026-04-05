import React from "react";

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

export default function HorarioFormModal({
  open, onClose, horarioForm, setHorarioForm, handleCreateOrUpdateHorario
}) {
  if (!open) return null;

  const isEdit = Boolean(horarioForm.id);

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center p-4 bg-[#0b1326]/90 backdrop-blur-md">
      <div className="kinetic-modal w-full max-w-lg animate-fade-in shadow-2xl">
        
        <header className="kinetic-modal-header">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">schedule</span>
            <h2 className="text-xl font-bold text-on-surface">
              {isEdit ? "Editar Horario" : "Nuevo Turno"}
            </h2>
          </div>
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={handleCreateOrUpdateHorario}>
          <div className="kinetic-modal-body space-y-6">
            <div className="space-y-2">
              <label className="kinetic-label tracking-widest block px-1">Día de la semana</label>
              <select
                className="kinetic-input kinetic-select"
                value={horarioForm.dia}
                onChange={(e) => setHorarioForm({ ...horarioForm, dia: parseInt(e.target.value) })}
              >
                {DIAS.map((dia, idx) => (
                  <option key={idx} value={idx}>{dia}</option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="kinetic-label tracking-widest block px-1 text-primary">Inicio</label>
                <div className="flex items-center gap-2">
                  <input
                    className="kinetic-input text-center"
                    type="number" min="0" max="23"
                    value={horarioForm.hora_inicio}
                    onChange={(e) => setHorarioForm({ ...horarioForm, hora_inicio: parseInt(e.target.value) })}
                  />
                  <span className="text-on-surface-variant font-bold">:</span>
                  <input
                    className="kinetic-input text-center"
                    type="number" min="0" max="59"
                    value={horarioForm.minuto_inicio}
                    onChange={(e) => setHorarioForm({ ...horarioForm, minuto_inicio: parseInt(e.target.value) })}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="kinetic-label tracking-widest block px-1 text-secondary">Fin</label>
                <div className="flex items-center gap-2">
                  <input
                    className="kinetic-input text-center"
                    type="number" min="0" max="23"
                    value={horarioForm.hora_fin}
                    onChange={(e) => setHorarioForm({ ...horarioForm, hora_fin: parseInt(e.target.value) })}
                  />
                  <span className="text-on-surface-variant font-bold">:</span>
                  <input
                    className="kinetic-input text-center"
                    type="number" min="0" max="59"
                    value={horarioForm.minuto_fin}
                    onChange={(e) => setHorarioForm({ ...horarioForm, minuto_fin: parseInt(e.target.value) })}
                  />
                </div>
              </div>
            </div>
            
            <p className="text-[10px] text-on-surface-variant font-medium px-1 flex items-center gap-2">
              <span className="material-symbols-outlined text-sm text-primary">info</span>
              Asegúrese de que el horario no colisione con otros turnos de la misma clase.
            </p>
          </div>

          <footer className="kinetic-modal-footer">
            <button 
              className="kinetic-btn kinetic-btn--ghost h-11 px-6"
              type="button" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              className="kinetic-btn kinetic-btn--secondary h-11 px-8"
              type="submit"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {isEdit ? "Guardar Cambios" : "Añadir Horario"}
            </button>
          </footer>
        </form>

      </div>
    </div>
  );
}
