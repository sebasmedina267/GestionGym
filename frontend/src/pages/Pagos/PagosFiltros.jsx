import React from 'react';

export default function PagosFiltros({ claseId, setClaseId, clases, mes, setMes, clasePrecio }) {
  return (
    <div className="glass-card" style={{
      display: "flex", gap: "2rem", marginBottom: "2rem",
      alignItems: "center", flexWrap: "wrap", justifyContent: "space-between"
    }}>
      <div style={{ display: "flex", gap: "1.5rem", flex: 1 }}>
        <div style={{ flex: 1, minWidth: "200px" }}>
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
        <div style={{ flex: 1, minWidth: "200px" }}>
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
        <div className="neon-glow-secondary" style={{
          background: "rgba(78, 222, 163, 0.1)",
          border: "1px solid rgba(78, 222, 163, 0.3)",
          padding: "0.75rem 1.5rem",
          borderRadius: "1rem",
          display: "flex",
          alignItems: "center",
          gap: "1rem"
        }}>
          <span className="label-caps" style={{ color: "var(--secondary)", margin: 0 }}>Precio Clase</span>
          <span style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--secondary)" }}>
            €{Number(clasePrecio).toFixed(2)}
          </span>
        </div>
      )}
    </div>
  );
}
