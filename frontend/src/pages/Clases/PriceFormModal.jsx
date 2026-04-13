import React from "react";
import "./Styles/PriceFormModal.css";
export default function PriceFormModal({
  open, onClose, precioForm, setPrecioForm, handleCreateOrUpdatePrecio
}) {
  if (!open) return null;

  const isEdit = Boolean(precioForm.id);

  return (
    <div className="price-modal-overlay">
      <div className="price-modal-container">
        
        <header className="price-modal-header">
          <div className="price-header-title">
            <span className="material-symbols-outlined" style={{color: "#ff5c72"}}>payments</span>
            <h2>
              {isEdit ? "Editar Plan" : "Nuevo Plan de Precio"}
            </h2>
          </div>
          <button className="price-modal-close" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={handleCreateOrUpdatePrecio}>
          <div className="price-modal-body">
            <div className="price-field-group">
              <label className="price-field-label">Nombre del Plan</label>
              <input
                className="horario-input"
                type="text"
                placeholder="Ej. Mensualidad Estándar..."
                value={precioForm.nombre}
                onChange={(e) => setPrecioForm({ ...precioForm, nombre: e.target.value })}
                required
              />
            </div>

            <div className="price-grid">
              <div className="price-field-group">
                <label className="price-field-label">Duración</label>
                <input
                  className="horario-input"
                  type="number"
                  min="1"
                  value={precioForm.cantidad_unidad}
                  onChange={(e) => setPrecioForm({ ...precioForm, cantidad_unidad: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="price-field-group">
                <label className="price-field-label">Unidad</label>
                <select
                  className="horario-input horario-select"
                  value={precioForm.tipo_unidad}
                  onChange={(e) => setPrecioForm({ ...precioForm, tipo_unidad: e.target.value })}
                >
                  <option value="MES">Meses</option>
                  <option value="SEMANA">Semanas</option>
                  <option value="DIA">Días</option>
                  <option value="CLASE">Clases</option>
                </select>
              </div>
            </div>

            <div className="price-field-group">
              <label className="price-field-label">Importe (€)</label>
              <div className="price-input-wrapper">
                <input
                  className="horario-input price-input-with-icon"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={precioForm.precio}
                  onChange={(e) => setPrecioForm({ ...precioForm, precio: e.target.value })}
                  required
                />
                <span className="price-currency-icon">€</span>
              </div>
            </div>
          </div>

          <footer className="price-modal-footer">
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
              style={{height: "2.75rem", padding: "0 2rem", background: "#ff5c72", border: "1px solid #cc4a5b", color: "#fff"}}
              type="submit"
            >
              <span className="material-symbols-outlined" style={{fontSize: "1.125rem"}}>check_circle</span>
              {isEdit ? "Guardar Cambios" : "Crear Plan"}
            </button>
          </footer>
        </form>

      </div>
    </div>
  );
}
