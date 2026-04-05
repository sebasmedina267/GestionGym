export default function DashboardInsights({ stats }) {
  return (
    <aside className="dashboard-v2__panel dashboard-v2__panel--narrow">
      <div className="dashboard-v2__panelHeader">
        <div>
          <p className="dashboard-v2__panelKicker">Estado</p>
          <h2 className="dashboard-v2__panelTitle">Pagos pendientes</h2>
        </div>
        <span className="dashboard-v2__pill">
          {stats.pagosPendientes} pendientes
        </span>
      </div>

      <div className="dashboard-v2__panelBody">
        <div className="dashboard-v2__insight">
          <p className="dashboard-v2__insightKicker">Insight</p>
          <p className="dashboard-v2__insightText">
            Prioriza los pagos vencidos para reducir riesgo y mejorar flujo de caja.
          </p>
        </div>
      </div>
    </aside>
  );
}
