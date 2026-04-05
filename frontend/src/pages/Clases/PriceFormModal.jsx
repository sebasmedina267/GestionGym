import React from "react";

export default function PriceFormModal({
  open, onClose, precioForm, setPrecioForm, handleCreateOrUpdatePrecio
}) {
  if (!open) return null;

  const isEdit = Boolean(precioForm.id);

  return (
    <div className="fixed inset-0 z-140 flex items-center justify-center p-4 bg-[#0b1326]/90 backdrop-blur-md">
      <div className="kinetic-modal w-full max-w-md animate-fade-in shadow-2xl">
        
        <header className="kinetic-modal-header">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#ff5c72]">payments</span>
            <h2 className="text-xl font-bold text-on-surface">
              {isEdit ? "Editar Plan" : "Nuevo Plan de Precio"}
            </h2>
          </div>
          <button 
            className="w-8 h-8 rounded-full flex items-center justify-center text-on-surface-variant hover:text-on-surface hover:bg-white/10"
            onClick={onClose}
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </header>

        <form onSubmit={handleCreateOrUpdatePrecio}>
          <div className="kinetic-modal-body space-y-6">
            <div className="space-y-2">
              <label className="kinetic-label tracking-widest block px-1">Nombre del Plan</label>
              <input
                className="kinetic-input"
                type="text"
                placeholder="Ej. Mensualidad Estándar..."
                value={precioForm.nombre}
                onChange={(e) => setPrecioForm({ ...precioForm, nombre: e.target.value })}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="kinetic-label tracking-widest block px-1">Duración</label>
                <input
                  className="kinetic-input"
                  type="number"
                  min="1"
                  value={precioForm.cantidad_unidad}
                  onChange={(e) => setPrecioForm({ ...precioForm, cantidad_unidad: parseInt(e.target.value) })}
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="kinetic-label tracking-widest block px-1">Unidad</label>
                <select
                  className="kinetic-input kinetic-select"
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

            <div className="space-y-2">
              <label className="kinetic-label tracking-widest block px-1">Importe (€)</label>
              <div className="relative">
                <input
                  className="kinetic-input pl-10"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  value={precioForm.precio}
                  onChange={(e) => setPrecioForm({ ...precioForm, precio: e.target.value })}
                  required
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-on-surface-variant font-bold">€</span>
              </div>
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
              className="kinetic-btn kinetic-btn--secondary h-11 px-8 bg-[#ff5c72]! text-white! shadow-[#ff5c72]/30!"
              type="submit"
            >
              <span className="material-symbols-outlined text-lg">check_circle</span>
              {isEdit ? "Guardar Cambios" : "Crear Plan"}
            </button>
          </footer>
        </form>

      </div>
    </div>
  );
}
