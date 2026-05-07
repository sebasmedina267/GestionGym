import "./Styles/DashboardPanels.css";

/**
 * DashboardInsights Component
 * 
 * Provides automated business intelligence and actionable advice 
 * based on current operational statistics.
 */
export default function DashboardInsights({ stats }) {
  return (
    <aside className="dashboard-panel-kinetic">
      {/* Header: Displays status summary and a quantitative badge */}
      <div className="dashboard-panel-header">
        <div>
          <p className="dashboard-panel-kicker">Estado de Cuenta</p>
          <h2 className="dashboard-panel-title">Pagos Pendientes</h2>
        </div>
        <span className="dashboard-panel-pill">
          {stats.pagosPendientes} Acción Requerida
        </span>
      </div>

      {/* 
        Panel Body:
        Contains high-value insights or warnings derived from gym data.
      */}
      <div className="dashboard-panel-body">
        <div className="dashboard-insight-card">
          <p className="dashboard-insight-kicker">Información de Gestión</p>
          <p className="dashboard-insight-text">
            Prioriza la resolución de pagos atrasados para minimizar el riesgo financiero y optimizar tu flujo de caja operativo.
          </p>
        </div>
      </div>
    </aside>
  );
}
