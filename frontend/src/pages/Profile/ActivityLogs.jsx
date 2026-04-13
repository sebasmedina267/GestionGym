import React from "react";
import "./Styles/ActivityLogs.css";

const ActivityLogs = ({ loading, logs }) => {
  return (
    <div className="activity-logs-card">
      <h3 className="activity-logs-title">Historial de Actividad Reciente</h3>
      
      {loading ? (
        <p className="activity-logs-loading">Cargando firmas de auditoría...</p>
      ) : logs.length === 0 ? (
        <p className="activity-logs-empty">No hay actividad registrada en la bitácora.</p>
      ) : (
        <div className="activity-logs-list">
          {logs.map((log) => (
            <div key={log.id} className="activity-log-item">
              <div className="activity-log-header">
                <span className="activity-log-entity">MODIFICACIÓN {log.entidad || 'GLOBAL'}</span>
                <span className="activity-log-date">
                  {new Date(log.fecha).toLocaleString()}
                </span>
              </div>
              
              <div className="activity-log-body">
                <span className="activity-log-action-badge">
                  {log.accion}
                </span>
                {log.entidadId && (
                  <span className="activity-log-affected-id">ID Afectado: #{log.entidadId}</span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ActivityLogs;
