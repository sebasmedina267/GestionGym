import React from 'react';

export default function PagosTabla({
  clases,
  claseId,
  clasePrecio,
  loadingEstado,
  estadoClase,
  handleQuickPayClick
}) {
  const currentClass = clases?.find(c => String(c.id) === String(claseId));

  const getInitials = (nombre, apellido) => {
    return `${nombre?.[0] || ''}${apellido?.[0] || ''}`.toUpperCase();
  };

  return (
    <div className="glass-card" style={{ flex: 1, padding: 0, overflow: "hidden" }}>
      <div style={{ padding: "1.5rem 2rem", borderBottom: "1px solid rgba(189, 194, 255, 0.1)" }}>
        <h3 style={{ margin: 0, fontSize: "1.25rem", color: "var(--primary)" }}>
          Estado de Pagos: {currentClass?.nombre}
        </h3>
        <p style={{ color: "var(--on-surface-variant)", fontSize: "0.875rem", marginTop: "0.5rem", marginBottom: 0 }}>
          Lista de alumnos inscritos. Gestiona los cobros mensuales de forma rápida.
        </p>
      </div>
      
      {loadingEstado ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--primary)" }}>
          <span className="material-symbols-outlined animate-spin" style={{ fontSize: "2rem" }}>sync</span>
          <p style={{ marginTop: "1rem" }}>Cargando estado...</p>
        </div>
      ) : estadoClase.length === 0 ? (
        <div style={{ padding: "3rem", textAlign: "center", color: "var(--on-surface-variant)" }}>
          <p style={{ fontStyle: "italic" }}>Esta clase no tiene alumnos inscritos actualmente.</p>
        </div>
      ) : (
        <div className="kinetic-table-container">
          <table className="kinetic-table">
            <thead>
              <tr>
                <th style={{ width: "80px" }}>Cobro</th>
                <th>Alumno</th>
                <th>Estado</th>
                <th>Método</th>
                <th>Fecha Pagado</th>
                <th style={{ textAlign: "right", minWidth: "100px" }}>Importe</th>
              </tr>
            </thead>
            <tbody>
              {estadoClase.map((alumno) => (
                <tr key={alumno.cliente_id}>
                  <td style={{ textAlign: "center" }}>
                    {alumno.pagado ? (
                      <span className="material-symbols-outlined" style={{ color: "var(--secondary)", fontWeight: "bold" }}>check_circle</span>
                    ) : (
                      <button 
                        onClick={() => handleQuickPayClick(alumno)}
                        className="neon-glow-primary"
                        style={{
                          width: "24px", height: "24px", borderRadius: "6px",
                          border: "2px solid var(--primary-container)",
                          background: "transparent", cursor: "pointer",
                          display: "flex", alignItems: "center", justifyContent: "center",
                          transition: "all 0.2s ease"
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "rgba(129, 140, 248, 0.2)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "transparent";
                        }}
                      >
                        <span className="material-symbols-outlined" style={{ fontSize: "16px", color: "var(--primary)", opacity: 0.5 }}>add</span>
                      </button>
                    )}
                  </td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                      <div className="avatar-initials">
                        {getInitials(alumno.cliente_nombre, alumno.cliente_apellido)}
                      </div>
                      <span style={{ fontWeight: "500" }}>{alumno.cliente_nombre} {alumno.cliente_apellido}</span>
                    </div>
                  </td>
                  <td>
                    {alumno.pagado ? 
                      <span className="status-badge paid">Pagado</span> : 
                      <span className="status-badge pending">Pendiente</span>
                    }
                  </td>
                  <td style={{ color: "var(--on-surface-variant)", fontSize: "0.75rem" }}>
                    {alumno.metodo_pago || '—'}
                  </td>
                  <td style={{ color: "var(--on-surface-variant)", fontSize: "0.75rem" }}>
                    {alumno.fecha_pago ? new Date(alumno.fecha_pago).toLocaleDateString() : '—'}
                  </td>
                  <td style={{ 
                    textAlign: "right", 
                    fontWeight: "900", 
                    whiteSpace: "nowrap",
                    color: alumno.pagado ? "var(--on-surface)" : "var(--tertiary)" 
                  }}>
                    {alumno.pagado ? `${Number(alumno.importe).toFixed(2)} €` : `${Number(clasePrecio || 0).toFixed(2)} €`}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
