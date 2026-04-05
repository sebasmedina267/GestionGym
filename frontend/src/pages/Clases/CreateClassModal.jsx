import React from "react";

export default function CreateClassModal({
  open, onClose, selectedClase, form, setForm, handleCreateClase, handleUpdateClase
}) {
  if (!open) return null;

  const isEdit = Boolean(selectedClase);

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 bg-[#0b1326]/90 backdrop-blur-md">
      <div className="kinetic-modal w-full max-w-md animate-fade-in shadow-2xl">
        
        <header className="kinetic-modal-header">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-primary">
              {isEdit ? 'edit_square' : 'add_circle'}
            </span>
            <h2 className="text-xl font-bold text-on-surface">
              {isEdit ? "Editar Clase" : "Nueva Clase"}
            </h2>
          </div>
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10"
            onClick={onClose}
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </header>

        <form onSubmit={isEdit ? handleUpdateClase : handleCreateClase}>
          <div className="kinetic-modal-body space-y-6">
            <div className="space-y-2">
              <label className="kinetic-label tracking-widest block px-1">Nombre de la Clase</label>
              <input
                className="kinetic-input"
                type="text"
                placeholder="Ej. CrossFit Elite, Yoga Flow..."
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            <div className="space-y-2">
              <label className="kinetic-label tracking-widest block px-1">Descripción (Opcional)</label>
              <textarea
                className="kinetic-input min-h-[120px] resize-none"
                placeholder="Describa los objetivos y el enfoque de la sesión..."
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
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
              <span className="material-symbols-outlined text-lg">
                {isEdit ? 'save' : 'check_circle'}
              </span>
              {isEdit ? "Guardar Cambios" : "Crear Clase"}
            </button>
          </footer>
        </form>

      </div>
    </div>
  );
}
