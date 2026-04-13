import React from 'react';
import './Styles/PagosTabla.css';

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
    <div className="glass-card pagos-tabla-card">
      <div className="pagos-tabla-header">
        <h3 className="pagos-tabla-title">
          Estado de Pagos: {currentClass?.nombre}
        </h3>
        <p className="pagos-tabla-subtitle">
          Lista de alumnos inscritos. Gestiona los cobros mensuales de forma rápida.
        </p>
      </div>
      
      {loadingEstado ? (
        <div className="pagos-tabla-loading">
          <span className="material-symbols-outlined animate-spin pagos-tabla-loading-icon">sync</span>
          <p className="pagos-tabla-loading-text">Cargando estado...</p>
        </div>
      ) : estadoClase.length === 0 ? (
        <div className="pagos-tabla-empty">
          <p>Esta clase no tiene alumnos inscritos actualmente.</p>
        </div>
      ) : (
        <div className="kinetic-table-container">
          <table className="kinetic-table">
            <thead>
              <tr>
                <th className="pagos-tabla-col-narrow">Cobro</th>
                <th>Alumno</th>
                <th>Estado</th>
                <th>Método</th>
                <th>Fecha Pagado</th>
                <th className="pagos-tabla-col-right">Importe</th>
              </tr>
            </thead>
            <tbody>
              {estadoClase.map((alumno) => (
                <tr key={alumno.cliente_id}>
                  <td className="pagos-tabla-cell-center">
                    {alumno.pagado ? (
                      <span className="material-symbols-outlined pagos-tabla-check">check_circle</span>
                    ) : (
                      <button 
                        onClick={() => handleQuickPayClick(alumno)}
                        className="neon-glow-primary pagos-tabla-add-btn"
                      >
                        <span className="material-symbols-outlined pagos-tabla-add-icon">add</span>
                      </button>
                    )}
                  </td>
                  <td>
                    <div className="pagos-tabla-alumno">
                      <div className="avatar-initials">
                        {getInitials(alumno.cliente_nombre, alumno.cliente_apellido)}
                      </div>
                      <span className="pagos-tabla-alumno-nombre">{alumno.cliente_nombre} {alumno.cliente_apellido}</span>
                    </div>
                  </td>
                  <td>
                    {alumno.pagado ? 
                      <span className="status-badge paid">Pagado</span> : 
                      <span className="status-badge pending">Pendiente</span>
                    }
                  </td>
                  <td className="pagos-tabla-text-small">
                    {alumno.metodo_pago || '—'}
                  </td>
                  <td className="pagos-tabla-text-small">
                    {alumno.fecha_pago ? new Date(alumno.fecha_pago).toLocaleDateString() : '—'}
                  </td>
                  <td className={`pagos-tabla-amount ${alumno.pagado ? 'paid' : 'pending'}`}>
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
