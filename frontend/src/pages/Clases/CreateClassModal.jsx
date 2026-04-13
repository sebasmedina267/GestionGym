import React from "react";
import "./Styles/CreateClassModal.css";

export default function CreateClassModal({
  open, onClose, selectedClase, form, setForm, handleCreateClase, handleUpdateClase
}) {
  if (!open) return null;

  const isEdit = Boolean(selectedClase);

  return (
    <div className="create-class-overlay">
      <div className="create-class-container">
        
        <header className="create-class-header">
          <div className="create-header-title">
            <span className="material-symbols-outlined" style={{color: "var(--primary)"}}>
              {isEdit ? 'edit_square' : 'add_circle'}
            </span>
            <h2>
              {isEdit ? "Editar Clase" : "Nueva Clase"}
            </h2>
          </div>
          <button className="create-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined" style={{fontSize: "1.25rem"}}>close</span>
          </button>
        </header>

        <form onSubmit={isEdit ? handleUpdateClase : handleCreateClase}>
          <div className="create-modal-body">
            <div className="create-field-group">
              <label className="create-field-label">Nombre de la Clase</label>
              <input
                className="create-input"
                type="text"
                placeholder="Ej. CrossFit Elite, Yoga Flow..."
                value={form.nombre}
                onChange={(e) => setForm({ ...form, nombre: e.target.value })}
                required
              />
            </div>

            <div className="create-field-group">
              <label className="create-field-label">Descripción (Opcional)</label>
              <textarea
                className="create-input create-textarea"
                placeholder="Describa los objetivos y el enfoque de la sesión..."
                value={form.descripcion}
                onChange={(e) => setForm({ ...form, descripcion: e.target.value })}
              />
            </div>
          </div>

          <footer className="create-modal-footer">
            <button 
              className="btn-secondary"
              style={{height: "2.75rem", padding: "0 1.5rem", background: "transparent"}}
              type="button" 
              onClick={onClose}
            >
              Cancelar
            </button>
            <button 
              className="btn-primary"
              style={{height: "2.75rem", padding: "0 2rem"}}
              type="submit"
            >
              <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>
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
