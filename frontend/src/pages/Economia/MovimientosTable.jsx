import React from "react";
import "./Styles/MovimientosTable.css";

/**
 * MovimientosTable Component
 * 
 * Renders a detailed, filterable transactional ledger for gym finances.
 * Supports granular filtering by transaction type (Revenue, Expense, or Unified).
 * 
 * Props:
 * @param {Array} movimientos - The complete list of financial movements.
 * @param {string} filtroTipo - The active filter state.
 * @param {Function} setFiltroTipo - State updater for filtering.
 */
export default function MovimientosTable({ movimientos, filtroTipo, setFiltroTipo }) {
  /** 
   * Client-side filtering for high-speed UI interaction 
   */
  const filteredMovimientos = movimientos.filter(m => 
    filtroTipo === "TODOS" ? true : filtroTipo === "INGRESOS" ? m.tipo === "INGRESO" : m.tipo === "GASTO"
  );
  
  return (
    <div className="economia-table-shell">
      {/* --- Ledger Filter Bar --- */}
      <div className="economia-filter-bar">
        <div className="economia-filter-buttons">
          <button 
            className={`economia-filter-btn ${filtroTipo === "TODOS" ? "active" : ""}`} 
            onClick={() => setFiltroTipo("TODOS")}
          >
            Todas las Transacciones
          </button>
          <button 
            className={`economia-filter-btn ingresos ${filtroTipo === "INGRESOS" ? "active" : ""}`} 
            onClick={() => setFiltroTipo("INGRESOS")}
          >
            ➕ Solo Ingresos
          </button>
          <button 
            className={`economia-filter-btn gastos ${filtroTipo === "GASTOS" ? "active" : ""}`} 
            onClick={() => setFiltroTipo("GASTOS")}
          >
            ➖ Solo Gastos
          </button>
        </div>
      </div>

      {/* --- Transactional Data Grid --- */}
      <div className="economia-table-container">
        {filteredMovimientos.length === 0 ? (
          <div className="economia-empty-state">
            <div className="economia-empty-state-icon">📋</div>
            <div className="economia-empty-state-title">El libro contable está vacío</div>
            <div className="economia-empty-state-text">No se han registrado movimientos financieros para este período.</div>
          </div>
        ) : (
          <table className="economia-table">
            <thead>
              <tr>
                <th>Fecha Efectiva</th>
                <th>Clasificación</th>
                <th>Fuente / Asignación</th>
                <th>Monto</th>
                <th>Estado de Liquidación</th>
                <th>Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredMovimientos.map((m, idx) => (
                <tr key={`${m.tipo}-${m.id}-${idx}`}>
                  <td>{new Date(m.fecha).toLocaleDateString()}</td>
                  <td>
                    <span className={`economia-table-type ${m.tipo === "INGRESO" ? "ingreso" : "gasto"}`}>
                      {m.tipo === "INGRESO" ? " INGRESO" : " GASTO"}
                    </span>
                  </td>
                  <td>
                    <div className="economia-table-description">
                      {m.fuente_tipo.replace("_", " ")}
                    </div>
                    <div className="economia-table-description-sub">{m.descripcion}</div>
                  </td>
                  <td className={`economia-table-amount ${m.tipo === "INGRESO" ? "ingreso" : "gasto"}`}>
                    {m.tipo === "INGRESO" ? "+" : "-"}${Number(m.importe).toFixed(2)}
                  </td>
                  <td>
                    <span className="economia-table-status">✔ Finalizado</span>
                  </td>
                  <td>
                    {/* Placeholder for future inline editing/deletion of manual records */}
                    <div className="economia-table-actions">
                      <button className="economia-table-action-btn" title="Editar entrada">✏️</button>
                      <button className="economia-table-action-btn" title="Eliminar entrada">🗑️</button>
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