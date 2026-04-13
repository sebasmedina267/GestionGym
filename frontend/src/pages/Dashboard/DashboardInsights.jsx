import "./Styles/DashboardPanels.css";


export default function DashboardInsights({ stats }) {
  return (
    <aside className="dashboard-panel-kinetic">
      <div className="dashboard-panel-header">
        <div>
          <p className="dashboard-panel-kicker">Estado</p>
          <h2 className="dashboard-panel-title">Pagos pendientes</h2>
        </div>
        <span className="dashboard-panel-pill">
          {stats.pagosPendientes} pendientes
        </span>
      </div>

      <div className="dashboard-panel-body">
        <div className="dashboard-insight-card">
          <p className="dashboard-insight-kicker">Insight</p>
          <p className="dashboard-insight-text">
            Prioriza los pagos vencidos para reducir riesgo y mejorar flujo de caja.
          </p>
        </div>
      </div>
    </aside>
  );
}
