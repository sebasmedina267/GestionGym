
import React from "react";
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import "./Styles/EconomiaModalForm.css";

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

  const closeAndReset = () => {
    onClose();
  };

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
        {/* Header */}
        <div className="economia-header-bg">
          <button className="economia-close-btn" onClick={closeAndReset}>
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

        {/* Form Content */}
        <div className="economia-form">
          <div className="economia-title-area">
            <h3 className="economia-title">
              {formType === "INGRESO" ? "Registrar Ingreso" : "Registrar Gasto"}
            </h3>
            <p className="economia-subtitle">
              {formType === "INGRESO" ? "Nueva fuente de ingresos" : "Nuevo gasto operacional"}
            </p>
          </div>

          <form className="economia-grid" onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
            {/* Description Field */}
            <div className="economia-full-width">
              <Input
                label="Descripción"
                value={form.descripcion}
                onChange={(v) => setForm({ ...form, descripcion: v })}
                variant="kinetic"
                placeholder={formType === "INGRESO" ? "Ej: Cuota de membresía..." : "Ej: Alquiler, Servicios..."}
                icon="description"
              />
            </div>

            {/* Amount & Date Row */}
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
                  label="Fecha"
                  type="date"
                  value={form.fecha}
                  onChange={(v) => setForm({ ...form, fecha: v })}
                  variant="kinetic"
                  icon="calendar_today"
                />
              </div>
            </div>

            {/* Category Selector */}
            {categorias && categorias.length > 0 && (
              <div className="economia-full-width economia-category-section">
                <label className="economia-category-label">
                  {formType === "INGRESO" ? "Categoría de Ingreso" : "Categoría de Gasto"}
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

            {/* Actions */}
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
                {saving ? (formType === "INGRESO" ? "Guardando..." : "Guardando...") : "Confirmar"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}