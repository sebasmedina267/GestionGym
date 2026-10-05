import "./Styles/DashboardHeader.css";

/**
 * DashboardHeader Component
 * 
 * Provides the visual entry point and global control actions for the dashboard.
 * Displays:
 * - Dynamic title reflecting the active gym context.
 * - Explanatory subtitle for operational clarity.
 * - Global actions for data export (PDF) and real-time synchronization.
 * 
 * Props:
 * @param {Object} gym - Current branch context.
 * @param {Function} onExport - Handler for generating financial/operational reports.
 * @param {Function} onSync - Handler for manual data refresh.
 */
export default function DashboardHeader({ gym, onExport, onSync, syncing }) {
  return (
    <header className="dashboard-hero-header">
      <div>
        <p className="dashboard-hero-kicker">Panel de control</p>
        <h1 className="dashboard-hero-title">
          {gym?.nombre ? `Resumen — ${gym.nombre}` : "Resumen general"}
        </h1>
        <p className="dashboard-hero-subtitle">
          Métricas clave, agenda de clases y estado financiero.
        </p>
      </div>
      <div className="dashboard-hero-actions">
        {/* Export Action: Triggers PDF generation */}
        <button
          className="dashboard-hero-btn dashboard-hero-btn--ghost"
          type="button"
          onClick={onExport}
        >
          <span className="material-symbols-outlined" style={{ fontSize: "1.1rem", verticalAlign: "middle", marginRight: "4px" }}>
            download
          </span>
          Exportar
        </button>
        {/* Sync Action: Triggers multi-stream data refetch */}
        <button
          className="dashboard-hero-btn dashboard-hero-btn--primary"
          type="button"
          onClick={onSync}
          disabled={syncing}
        >
          <span
            className="material-symbols-outlined"
            style={{
              fontSize: "1.1rem",
              verticalAlign: "middle",
              marginRight: "4px",
              animation: syncing ? "spin 1s linear infinite" : "none",
              display: "inline-block"
            }}
          >
            sync
          </span>
          {syncing ? "Sincronizando..." : "Sincronizar"}
        </button>
      </div>
    </header>
  );
}
