import React from 'react';
import { UPLOADS_URL } from "../../api/axios";

export default function AdminsTable({
  tableData,
  filteredAdmins,
  handleOpenEdit,
  handleOpenDelete
}) {
  return (
    <div style={{background: "var(--bg-secondary)", borderRadius: "12px", border: "1px solid var(--border-color)", overflow: "hidden"}}>
      <table style={{width: "100%", borderCollapse: "collapse"}}>
        <thead style={{background: "var(--bg-tertiary)", borderBottom: "1px solid var(--border-color)"}}>
          <tr>
            <th style={{padding: "16px", textAlign: "left", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-secondary)"}}>Foto</th>
            <th style={{padding: "16px", textAlign: "left", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-secondary)"}}>Nombre</th>
            <th style={{padding: "16px", textAlign: "left", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-secondary)"}}>Apellido</th>
            <th style={{padding: "16px", textAlign: "left", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-secondary)"}}>Gimnasio</th>
            <th style={{padding: "16px", textAlign: "left", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-secondary)"}}>Rol</th>
            <th style={{padding: "16px", textAlign: "center", fontSize: "0.9rem", fontWeight: "600", color: "var(--text-secondary)"}}>Acciones</th>
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, idx) => (
            <tr key={row.id} style={{borderBottom: "1px solid var(--border-color)", backgroundColor: idx % 2 === 0 ? "transparent" : "rgba(255,255,255,0.02)"}}>
              <td style={{padding: "16px"}}>
                {filteredAdmins[idx]?.foto ? (
                  <img src={`${UPLOADS_URL}/${filteredAdmins[idx].foto}`} alt={row.nombre} style={{width: "40px", height: "40px", borderRadius: "50%", objectFit: "cover"}} onError={(e) => {e.target.style.display = "none"}} />
                ) : (
                  <div style={{width: "40px", height: "40px", borderRadius: "50%", background: "var(--bg-tertiary)", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-secondary)"}}>
                    👤
                  </div>
                )}
              </td>
              <td style={{padding: "16px", color: "var(--text-primary)"}}>{row.nombre}</td>
              <td style={{padding: "16px", color: "var(--text-primary)"}}>{row.apellido}</td>
              <td style={{padding: "16px", color: "var(--text-secondary)"}}>{row.gymNombre}</td>
              <td style={{padding: "16px"}}>
                <span style={{padding: "4px 12px", background: row.rol === "Dueño" ? "var(--primary-alpha)" : "var(--bg-tertiary)", borderRadius: "4px", fontSize: "0.8rem", fontWeight: "600", color: row.rol === "Dueño" ? "var(--primary-light)" : "var(--text-secondary)"}}>
                  {row.rol}
                </span>
              </td>
              <td style={{padding: "16px", textAlign: "center"}}>
                <button
                  onClick={() => handleOpenEdit(row)}
                  style={{padding: "6px 12px", background: "var(--primary-alpha)", color: "var(--primary-light)", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", marginRight: "8px", transition: "all 0.3s ease"}}
                  onMouseEnter={(e) => {e.target.style.background = "var(--primary)"; e.target.style.color = "white"}}
                  onMouseLeave={(e) => {e.target.style.background = "var(--primary-alpha)"; e.target.style.color = "var(--primary-light)"}}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleOpenDelete(row)}
                  style={{padding: "6px 12px", background: "rgba(239, 68, 68, 0.1)", color: "var(--danger-color)", border: "none", borderRadius: "6px", cursor: "pointer", fontSize: "0.8rem", fontWeight: "600", transition: "all 0.3s ease"}}
                  onMouseEnter={(e) => {e.target.style.background = "var(--danger-color)"; e.target.style.color = "white"}}
                  onMouseLeave={(e) => {e.target.style.background = "rgba(239, 68, 68, 0.1)"; e.target.style.color = "var(--danger-color)"}}
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
