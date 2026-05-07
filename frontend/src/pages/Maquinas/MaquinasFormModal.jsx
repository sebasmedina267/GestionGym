import React from "react";
import Modal from "../../components/ui/Modal";
import "./Styles/MaquinasFormModal.css";

/**
 * MaquinasFormModal Component
 * 
 * Provides a unified form interface for both creating new machinery records
 * and updating existing ones.
 * 
 * Features:
 * - Dynamic titles based on 'editing' mode.
 * - Multi-field data collection (Name, Muscle Group, Quantity, Location, Status).
 * - Multi-part form support for image uploading with preview.
 * - Integrated validation feedback (errors display).
 * - Kinetic visual style aligned with the management dashboard.
 * 
 * @param {Object} props - Component properties
 * @param {boolean} props.open - Controls modal visibility
 * @param {Function} props.setOpen - Toggles modal state
 * @param {Object|null} props.editing - The machine object being edited (or null for creation)
 * @param {Object} props.form - Current state of the form fields
 * @param {Function} props.setForm - Updates form state
 * @param {Object} props.errors - Validation errors mapping
 * @param {boolean} props.saving - Indicates if a backend request is in progress
 * @param {Function} props.handleSave - Triggers form submission logic
 * @param {Function} props.resetForm - Clears form data and resets state
 */
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
        {/* Header: Displays dynamic title and global close action */}
        <div className="maquina-form-header">
           <h1 className="maquina-form-title">{editing ? "Actualizar Equipo" : "Registrar Máquina"}</h1>
           <button className="maquina-close-btn" onClick={() => { setOpen(false); resetForm(); }}>
              <span className="material-symbols-outlined">close</span>
           </button>
        </div>

        <form className="maquina-form-grid" onSubmit={(e) => { e.preventDefault(); handleSave(); }}>
          {/* Identity: Core equipment name */}
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

          {/* Classification: Usage group and aggregate quantity */}
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

          {/* Logistics: Physical location and operational health status */}
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

          {/* Documentation: Extended specifications and technical notes */}
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

          {/* Assets: Visual documentation via equipment photography */}
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

        {/* Global Actions: Process persistence or cancel the workflow */}
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
