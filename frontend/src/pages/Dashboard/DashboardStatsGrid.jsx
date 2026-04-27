import "./Styles/DashboardStatsGrid.css";

export default function DashboardStatsGrid({ stats }) {
  return (
    <section className="dashboard-stats-container" aria-label="Métricas">
      <article className="dashboard-stat-card">
        <div className="dashboard-stat-top">
          <span className="dashboard-stat-icon-wrapper icon-wrapper--primary">
            👥
          </span>
          <span className="dashboard-stat-chip dashboard-stat-chip--good">
            ACTIVOS
          </span>
        </div>
        <p className="dashboard-stat-value">{stats.clientesActivos}</p>
        <p className="dashboard-stat-label">Clientes</p>
      </article>

      <article className="dashboard-stat-card">
        <div className="dashboard-stat-top">
          <span className="dashboard-stat-icon-wrapper icon-wrapper--primary">
            🏋️
          </span>
          <span className="dashboard-stat-chip">HOY</span>
        </div>
        <p className="dashboard-stat-value">{stats.clasesTotales}</p>
        <p className="dashboard-stat-label">Clases programadas</p>
      </article>

      <article className="dashboard-stat-card">
        <div className="dashboard-stat-top">
          <span className="dashboard-stat-icon-wrapper icon-wrapper--bad">
            💳
          </span>
          <span className="dashboard-stat-chip dashboard-stat-chip--bad">
            PENDIENTES
          </span>
        </div>
        <p className="dashboard-stat-value">{stats.pagosPendientes}</p>
        <p className="dashboard-stat-label">Pagos por procesar</p>
      </article>

      <article className="dashboard-stat-card">
        <div className="dashboard-stat-top">
          <span className="dashboard-stat-icon-wrapper icon-wrapper--good">
            📈
          </span>
          <span className="dashboard-stat-chip dashboard-stat-chip--good">
            INGRESOS
          </span>
        </div>
        <p className="dashboard-stat-value">
          €{stats.ingresos.toFixed(2)}
        </p>
        <p className="dashboard-stat-label">Total</p>
      </article>

      <article className="dashboard-stat-card">
        <div className="dashboard-stat-top">
          <span className="dashboard-stat-icon-wrapper icon-wrapper--bad">
            📉
          </span>
          <span className="dashboard-stat-chip dashboard-stat-chip--bad">
            GASTOS
          </span>
        </div>
        <p className="dashboard-stat-value">
          €{stats.gastos.toFixed(2)}
        </p>
        <p className="dashboard-stat-label">Total</p>
      </article>

      <article className="dashboard-stat-card dashboard-stat-card--featured">
        <div className="dashboard-stat-top">
          <span className="dashboard-stat-icon-wrapper icon-wrapper--primary">
            ⚖️
          </span>
          <span
            className={[
              "dashboard-stat-chip",
              stats.balance >= 0
                ? "dashboard-stat-chip--good"
                : "dashboard-stat-chip--bad",
            ].join(" ")}
          >
            BALANCE
          </span>
        </div>
        <p className="dashboard-stat-value">
          €{stats.balance.toFixed(2)}
        </p>
        <p className="dashboard-stat-label">
          {stats.balance >= 0 ? "Beneficio neto" : "Pérdida neta"}
        </p>
      </article>
    </section>
  );
}
