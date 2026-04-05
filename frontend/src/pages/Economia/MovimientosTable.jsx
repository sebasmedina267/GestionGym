// MovimientosTable.jsx
import React from "react";

export default function MovimientosTable({ movimientos, filtroTipo, setFiltroTipo }) {
  const filteredMovimientos = movimientos.filter(m => 
    filtroTipo === "TODOS" ? true : filtroTipo === "INGRESOS" ? m.tipo === "INGRESO" : m.tipo === "GASTO"
  );

  return (
    <div style={{ marginTop: "40px" }}>
      <div className="economia-filter-bar">
        <div className="economia-filter-buttons">
          <button className={`economia-filter-btn ${filtroTipo === "TODOS" ? "active" : ""}`} onClick={() => setFiltroTipo("TODOS")}>📊 Todos</button>
          <button className={`economia-filter-btn ingresos ${filtroTipo === "INGRESOS" ? "active" : ""}`} onClick={() => setFiltroTipo("INGRESOS")}>➕ Ingresos</button>
          <button className={`economia-filter-btn gastos ${filtroTipo === "GASTOS" ? "active" : ""}`} onClick={() => setFiltroTipo("GASTOS")}>➖ Gastos</button>
        </div>
      </div>

      <div className="economia-table-container">
        {filteredMovimientos.length === 0 ? (
          <div className="economia-empty-state">
            <div className="economia-empty-state-icon">📋</div>
            <div className="economia-empty-state-title">Sin movimientos</div>
            <div className="economia-empty-state-text">No se registraron movimientos en este período</div>
          </div>
        ) : (
          <table className="economia-table">
            <thead>
              <tr>
                <th>Fecha</th>
                <th>Tipo</th>
                <th>Origen / Destino</th>
                <th>Monto</th>
                <th>Estado</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovimientos.map((m, idx) => (
                <tr key={`${m.tipo}-${m.id}-${idx}`}>
                  <td>{new Date(m.fecha).toLocaleDateString()}</td>
                  <td><span className={`economia-table-type ${m.tipo === "INGRESO" ? "ingreso" : "gasto"}`}>{m.tipo === "INGRESO" ? "✅ INGRESO" : "❌ GASTO"}</span></td>
                  <td>
                    <div className="economia-table-description">{m.fuente_tipo.replace("_", " ")}</div>
                    <div className="economia-table-description-sub">{m.descripcion}</div>
                  </td>
                  <td className={`economia-table-amount ${m.tipo === "INGRESO" ? "ingreso" : "gasto"}`}>{m.tipo === "INGRESO" ? "+" : "-"}${Number(m.importe).toFixed(2)}</td>
                  <td><span style={{ color: "#4edea3", fontWeight: "600" }}>✔ Completado</span></td>
                  <td>
                    <div className="economia-table-actions">
                      <button className="economia-table-action-btn">✏️</button>
                      <button className="economia-table-action-btn">🗑️</button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}