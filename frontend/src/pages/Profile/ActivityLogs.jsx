import React from "react";

const ActivityLogs = ({ loading, logs }) => {
  return (
    <div style={{background: "var(--bg-secondary)", padding: "24px", borderRadius: "12px", border: "var(--glass-border)"}}>
      <h3 style={{marginTop: 0, marginBottom: "24px", color: "var(--text-primary)"}}>Historial de Actividad Reciente</h3>
      
      {loading ? (
        <p style={{color: "var(--text-tertiary)"}}>Cargando firmas de auditoría...</p>
      ) : logs.length === 0 ? (
        <p style={{color: "var(--text-tertiary)"}}>No hay actividad registrada en la bitácora.</p>
      ) : (
        <div style={{display: "flex", flexDirection: "column", gap: "16px", maxHeight: "600px", overflowY: "auto", paddingRight: "8px"}}>
          {logs.map((log) => (
            <div key={log.id} style={{
              padding: "16px", 
              background: "var(--bg-tertiary)", 
              borderRadius: "8px", 
              borderLeft: `4px solid var(--primary)`,
              display: "flex",
              flexDirection: "column",
              gap: "8px"
            }}>
              <div style={{display: "flex", justifyContent: "space-between", alignItems: "center"}}>
                <span style={{fontWeight: "bold", color: "var(--text-primary)"}}>MODIFICACIÓN {log.entidad || 'GLOBAL'}</span>
                <span style={{fontSize: "0.8rem", color: "var(--text-secondary)"}}>
                  {new Date(log.fecha).toLocaleString()}
                </span>
              </div>
              
              <div style={{display: "flex", alignItems: "center", gap: "12px"}}>
                <span style={{
                  padding: "4px 8px", 
                  background: "var(--bg-secondary)", 
                  borderRadius: "4px", 
                  fontSize: "0.8rem",
                  fontWeight: "bold",
                  border: "1px solid var(--border-color)"
                }}>
                  {log.accion}
                </span>
                {log.entidadId && (
                  <span style={{fontSize: "0.85rem", color: "var(--text-secondary)"}}>ID Afectado: #{log.entidadId}</span>
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
