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
      <table className="admins-table">
        <thead className="admins-table-head">
          <tr>
            <th className="admins-table-th">Foto</th>
            <th className="admins-table-th">Nombre</th>
            <th className="admins-table-th">Apellido</th>
            <th className="admins-table-th">Gimnasio</th>
            <th className="admins-table-th">Rol</th>
            <th className="admins-table-th admins-table-th-center">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, idx) => (
            <tr key={row.id} className="admins-table-row">
              <td className="admins-table-td">
                {filteredAdmins[idx]?.foto ? (
                  <img 
                    src={`${UPLOADS_URL}/${filteredAdmins[idx].foto}`} 
                    alt={row.nombre} 
                    className="admins-table-photo-img" 
                    onError={(e) => {e.target.style.display = "none"}} 
                  />
                ) : (
                  <div className="admins-table-photo-placeholder">
                    👤
                  </div>
                )}
              </td>
              <td className="admins-table-td">{row.nombre}</td>
              <td className="admins-table-td">{row.apellido}</td>
              <td className="admins-table-td-secondary">{row.gymNombre}</td>
              <td className="admins-table-td">
                <span className={`admins-table-role ${row.rol === "Dueño" ? "admins-table-role-owner" : "admins-table-role-standard"}`}>
                  {row.rol}
                </span>
              </td>
              <td className="admins-table-td-center">
                <button
                  onClick={() => handleOpenEdit(row)}
                  className="admins-table-btn admins-table-btn-edit"
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleOpenDelete(row)}
                  className="admins-table-btn admins-table-btn-delete"
                >
                  🗑️ Eliminar
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
