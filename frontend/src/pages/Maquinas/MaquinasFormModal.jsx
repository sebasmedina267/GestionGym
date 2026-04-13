import React from "react";
import Modal from "../../components/ui/Modal";
import "./Styles/MaquinasFormModal.css";

export default function MaquinasFormModal({ open, setOpen, editing, form, setForm, errors, saving, handleSave, resetForm }) {
  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
        resetForm();
      }}
      clean
    >
      <div className="maquina-form-container">
        {/* Header */}
        <div className="maquina-form-header">
           <h1 className="maquina-form-title">{editing ? "Actualizar Equipo" : "Registrar Máquina"}</h1>
           <button className="maquina-close-btn" onClick={() => { setOpen(false); resetForm(); }}>
              <span className="material-symbols-outlined">close</span>
           </button>
        </div>

        <form className="maquina-form-grid" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Nombre */}
          <div className="maquina-form-group full-width">
            <label className="maquina-form-label">Nombre del equipo</label>
            <input
              className={`maquina-form-input ${errors.nombre ? "error" : ""}`}
              placeholder="Ej: Prensa de Piernas Profesional"
              value={form.nombre}
              onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            />
            {errors.nombre && <p className="error-text-kinetic">{errors.nombre}</p>}
          </div>

          {/* Row: Grupo & Cantidad */}
          <div className="maquina-form-group">
            <label className="maquina-form-label">Grupo Muscular / Uso</label>
            <input
              className="maquina-form-input"
              placeholder="Ej: Piernas"
              value={form.uso}
              onChange={(e) => setForm({ ...form, uso: e.target.value })}
            />
          </div>

          <div className="maquina-form-group">
            <label className="maquina-form-label">Cantidad</label>
            <input
              className="maquina-form-input"
              type="number"
              min="1"
              value={form.cantidad}
              onChange={(e) => setForm({ ...form, cantidad: e.target.value })}
            />
          </div>

          {/* Row: Ubicación & Estado */}
          <div className="maquina-form-group">
            <label className="maquina-form-label">Ubicación Física</label>
            <input
              className="maquina-form-input"
              placeholder="Zona de Pesos Libres"
              value={form.ubicacion}
              onChange={(e) => setForm({ ...form, ubicacion: e.target.value })}
            />
          </div>

          <div className="maquina-form-group">
            <label className="maquina-form-label">Estado Actual</label>
            <select
              className="maquina-form-select"
              value={form.estado}
              onChange={(e) => setForm({ ...form, estado: e.target.value })}
            >
              <option value="Disponible">Disponible</option>
              <option value="En Uso">En Uso</option>
              <option value="Mantenimiento">Mantenimiento</option>
            </select>
          </div>

          {/* Descripción */}
          <div className="maquina-form-group full-width">
            <label className="maquina-form-label">Descripción y Detalles</label>
            <textarea 
              value={form.descripcion}
              onChange={(e) => setForm({...form, descripcion: e.target.value})}
              placeholder="Especificaciones técnicas, marca o notas..."
              rows="3"
              className="maquina-form-textarea"
            />
          </div>

          {/* Foto area inside grid or below? Let's put it full width below */}
          <div className="maquina-form-group full-width">
            <label className="maquina-form-label">Fotografía del Equipo</label>
            <div 
              className="maquina-dropzone"
              onClick={() => document.getElementById('foto-input').click()}
            >
              <input 
                id="foto-input"
                type="file" 
                className="hidden" 
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files[0];
                  if (file) setForm({ ...form, imagen: file });
                }}
              />
              {form.imagen ? (
                <div className="maquina-preview-wrapper" style={{ width: '100%', height: '100%' }}>
                  <img 
                    src={
                      typeof form.imagen === "string"
                        ? form.imagen
                        : URL.createObjectURL(form.imagen)
                    } 
                    alt="Preview" 
                    className="maquina-preview-img" 
                  />
                  <button 
                    type="button" 
                    onClick={(e) => {
                      e.stopPropagation();
                      setForm({ ...form, imagen: null });
                    }}
                    className="btn-remove-preview"
                  >
                    <span className="material-symbols-outlined">close</span>
                  </button>
                </div>
              ) : (
                <div className="maquina-dropzone-content">
                  <span className="material-symbols-outlined maquina-dropzone-icon">add_a_photo</span>
                  <span className="maquina-dropzone-text">Click para cargar fotografía</span>
                </div>
              )}
            </div>
          </div>
        </form>

        <div className="maquina-modal-actions">
          <button 
            type="button"
            onClick={() => { setOpen(false); resetForm(); }}
            className="btn-modal-action btn-modal-cancel"
            disabled={saving}
          >
            CANCELAR
          </button>
          <button 
            type="button"
            disabled={saving}
            onClick={handleSave}
            className="btn-modal-action btn-modal-confirm"
          >
            {saving ? "GUARDANDO..." : editing ? "GUARDAR CAMBIOS" : "REGISTRAR MÁQUINA"}
          </button>
        </div>
      </div>
    </Modal>
  );
}
