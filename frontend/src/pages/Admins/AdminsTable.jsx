import React from 'react';
import { UPLOADS_URL } from "../../api/axios";
import './Styles/AdminsTable.css';

export default function AdminsTable({
  tableData,
  filteredAdmins,
  handleOpenEdit,
  handleOpenDelete
}) {
  return (
    <div className="admins-table-container">
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
                  <div className="row-selection-bar"></div>
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
                <td className="admins-table-td font-bold text-white">{row.nombre}</td>
                <td className="admins-table-td text-on-surface-variant">{row.apellido}</td>
                <td className="admins-table-td font-data-mono text-sm">{row.email || 'N/A'}</td>
                <td className="admins-table-td">
                  <span className="gym-tag-pill">{row.gymNombre}</span>
                </td>
                <td className="admins-table-td">
                  <span className={`role-badge ${row.rol === "Dueño" ? "badge-owner" : row.rol === "Manager" ? "badge-manager" : "badge-standard"}`}>
                    {row.rol.toUpperCase()}
                  </span>
                </td>
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
