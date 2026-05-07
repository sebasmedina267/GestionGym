import React from 'react';
import { UPLOADS_URL } from "../../api/axios";
import './Styles/AdminsTable.css';

/**
 * AdminsTable Component
 * 
 * Renders the primary staff registry in a high-fidelity data grid.
 * Features:
 * - Dynamic avatar rendering with fallback placeholders.
 * - Semantic role-based badges for visual categorization.
 * - Integrated operational controls for profile editing and account removal.
 * - Responsive layout with horizontal scroll support for dense datasets.
 * 
 * Props:
 * @param {Array} tableData - Normalized list of staff members for display.
 * @param {Array} filteredAdmins - The raw list of staff entities for complex data access (e.g., photo paths).
 * @param {Function} handleOpenEdit - Handler to trigger the edit modal.
 * @param {Function} handleOpenDelete - Handler to trigger the deletion guard.
 */
export default function AdminsTable({
  tableData,
  filteredAdmins,
  handleOpenEdit,
  handleOpenDelete
}) {
  return (
    <div className="admins-table-container">
      {/* Table Header: Identity and global list actions */}
      <div className="table-header-info">
        <span className="table-title-label uppercase tracking-widest">Listado de Administradores</span>
        <div className="table-header-actions">
          <span className="material-symbols-outlined icon-action">filter_list</span>
          <span className="material-symbols-outlined icon-action">download</span>
        </div>
      </div>
      
      <div className="table-scroll-area">
        <table className="admins-table">
          <thead className="admins-table-head">
            <tr>
              <th className="admins-table-th">FOTO</th>
              <th className="admins-table-th">NOMBRE</th>
              <th className="admins-table-th">APELLIDO</th>
              <th className="admins-table-th">EMAIL</th>
              <th className="admins-table-th">GIMNASIO</th>
              <th className="admins-table-th">ROL</th>
              <th className="admins-table-th text-center">ACCIONES</th>
            </tr>
          </thead>
          <tbody className="admins-table-body">
            {tableData.map((row, idx) => (
              <tr key={row.id} className="admins-table-row group">
                <td className="admins-table-td relative">
                  {/* High-fidelity selection bar for better visual focus on hover */}
                  <div className="row-selection-bar"></div>
                  
                  {/* Identity Documentation: Staff Profile Picture */}
                  <div className="avatar-wrapper">
                    {filteredAdmins[idx]?.foto ? (
                      <img 
                        src={`${UPLOADS_URL}/${filteredAdmins[idx].foto}`} 
                        alt={row.nombre} 
                        className="staff-avatar-img" 
                        onError={(e) => {e.target.style.display = "none"}} 
                      />
                    ) : (
                      <div className="staff-avatar-placeholder">
                        <span className="material-symbols-outlined">person</span>
                      </div>
                    )}
                  </div>
                </td>
                
                {/* Descriptive Attributes: Name and Contact info */}
                <td className="admins-table-td font-bold text-white">{row.nombre}</td>
                <td className="admins-table-td text-on-surface-variant">{row.apellido}</td>
                <td className="admins-table-td font-data-mono text-sm">{row.email || 'N/A'}</td>
                
                {/* Logistics: Scope of administrative authority (Branch) */}
                <td className="admins-table-td">
                  <span className="gym-tag-pill">{row.gymNombre}</span>
                </td>
                
                {/* Classification: Role Badge with dynamic semantic coloring */}
                <td className="admins-table-td">
                  <span className={`role-badge ${row.rol === "Dueño" ? "badge-owner" : row.rol === "Gerente" ? "badge-manager" : "badge-standard"}`}>
                    {row.rol.toUpperCase()}
                  </span>
                </td>
                
                {/* Management Controls: Targeted actions for the specific entity */}
                <td className="admins-table-td text-center">
                  <div className="action-buttons-group">
                    <button
                      onClick={() => handleOpenEdit(row)}
                      className="action-btn edit-btn"
                      title="Editar"
                    >
                      <span className="material-symbols-outlined">edit</span>
                    </button>
                    <button
                      onClick={() => handleOpenDelete(row)}
                      className="action-btn delete-btn"
                      title="Eliminar"
                    >
                      <span className="material-symbols-outlined">delete</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      {/* Footer: Pagination and summary of the visible dataset */}
      <div className="table-footer-pagination">
        <span className="pagination-info">Mostrando {tableData.length} administradores registrados</span>
        <div className="pagination-controls">
          <button className="page-nav-btn"><span className="material-symbols-outlined">chevron_left</span></button>
          <button className="page-num-btn active">1</button>
          <button className="page-nav-btn"><span className="material-symbols-outlined">chevron_right</span></button>
        </div>
      </div>
    </div>
  );
}
