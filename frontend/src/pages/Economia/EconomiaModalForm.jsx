import React from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import "./Styles/EconomiaModalForm.css";

/**
 * EconomiaModalForm Component
 * 
 * A specialized modal for registering manual financial events (Income or Expenses).
 * Features context-sensitive styling and categorization based on the 'formType'.
 * 
 * Props:
 * @param {boolean} open - Visibility toggle.
 * @param {Function} onClose - Dismisses the modal.
 * @param {string} formType - Defines the transaction nature ('INGRESO' or 'GASTO').
 * @param {Object} form - Controlled form state.
 * @param {Function} setForm - Form state updater.
 * @param {boolean} saving - Submission loading state.
 * @param {Function} onSubmit - Form submission handler.
 * @param {Array} categorias - List of classification tags (e.g., 'Rent', 'Sales').
 */
export default function EconomiaModalForm({ 
  open, 
  onClose, 
  formType, 
  form, 
  setForm, 
  saving, 
  onSubmit,
  categorias = []
}) {

  /** Standardized dismissal handler */
  const closeAndReset = () => {
    onClose();
  };

  /** Updates the transaction classification tag */
  const handleCategorySelect = (categoria) => {
    setForm({ ...form, categoria });
  };

  return (
    <Modal
      open={open}
      onClose={closeAndReset}
      clean
    >
      <div className="economia-modal-container">
        {/* --- Branding Header --- */}
        <div className="economia-header-bg">
          <button className="economia-close-btn" onClick={closeAndReset} aria-label="Close">
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="economia-icon-wrapper">
            <div className="economia-icon-circle" data-type={formType}>
              <span className="economia-icon">
                {formType === "INGRESO" ? "💰" : "💸"}
              </span>
            </div>
          </div>
        </div>

        {/* --- Core Form Interface --- */}
        <div className="economia-form">
          <div className="economia-title-area">
            <h3 className="economia-title">
              {formType === "INGRESO" ? "Registrar Nuevo Ingreso" : "Registrar Gasto Operativo"}
            </h3>
            <p className="economia-subtitle">
              {formType === "INGRESO" 
                ? "Añade manualmente un ingreso al libro contable de la sucursal." 
                : "Registra un gasto relacionado con las instalaciones o costes fijos."}
            </p>
          </div>

          <form className="economia-grid" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            {/* Field: Transaction Description */}
            <div className="economia-full-width">
              <Input
                label="Descripción de la Entrada"
                value={form.descripcion}
                onChange={(v) => setForm({ ...form, descripcion: v })}
                variant="kinetic"
                placeholder={formType === "INGRESO" ? "Ej. Pago de sesión de entrenamiento personal..." : "Ej. Alquiler mensual del local..."}
                icon="description"
              />
            </div>

            {/* Fieldset: Financial Context (Amount & Date) */}
            <div className="economia-row">
              <div className="economia-input-group">
                <Input
                  label="Monto (€)"
                  type="number"
                  min="0.01"
                  step="0.01"
                  value={form.importe}
                  onChange={(v) => setForm({ ...form, importe: v })}
                  variant="kinetic"
                  placeholder="0.00"
                  icon="euro"
                />
              </div>
              <div className="economia-input-group">
                <Input
                  label="Fecha Efectiva"
                  type="date"
                  value={form.fecha}
                  onChange={(v) => setForm({ ...form, fecha: v })}
                  variant="kinetic"
                  icon="calendar_today"
                />
              </div>
            </div>

            {/* Field: Intelligent Categorization Chips */}
            {categorias && categorias.length > 0 && (
              <div className="economia-full-width economia-category-section">
                <label className="economia-category-label">
                  {formType === "INGRESO" ? "Clasificación de Ingresos" : "Categorización de Gastos"}
                </label>
                <div className="economia-category-chips">
                  {categorias.map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      className={`economia-chip ${form.categoria === cat ? "economia-chip-active" : ""}`}
                      onClick={() => handleCategorySelect(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* --- Form Control Actions --- */}
            <div className="economia-full-width economia-form-actions">
              <button
                type="button"
                className="btn-economia-cancel"
                onClick={closeAndReset}
              >
                Cancelar
              </button>
              <button
                type="submit"
                className={`btn-economia-submit ${formType === "INGRESO" ? "btn-ingreso" : "btn-gasto"}`}
                disabled={saving || !form.descripcion || !form.importe || !form.fecha}
              >
                {saving ? "Procesando..." : "Confirmar Transacción"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}