import React from 'react';
import './Styles/PagosFiltros.css';

export default function PagosFiltros({ claseId, setClaseId, clases, mes, setMes, clasePrecio }) {
  return (
    <div className="glass-card pagos-filtros-container">
      <div className="pagos-filtros-group">
        <div className="pagos-filtros-item">
          <label className="label-caps">Disciplina / Clase</label>
          <select 
            className="kinetic-select" 
            value={claseId} 
            onChange={(e) => setClaseId(e.target.value)}
          >
            <option value="">-- Selecciona una clase --</option>
            {clases?.map(c => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        </div>
        <div className="pagos-filtros-item">
          <label className="label-caps">Mes de Cobro</label>
          <input 
            type="month" 
            className="kinetic-input"
            value={mes} 
            onChange={(e) => setMes(e.target.value)}
          />
        </div>
      </div>

      {clasePrecio && (
        <div className="neon-glow-secondary pagos-filtros-precio-clase">
          <span className="label-caps pagos-filtros-precio-label">Precio Clase</span>
          <span className="pagos-filtros-precio-valor">
            €{Number(clasePrecio).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
