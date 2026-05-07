import "./Styles/DashboardStatsGrid.css";

/**
 * DashboardStatsGrid Component
 * 
 * Displays a grid of key performance indicators (KPIs). 
 * Each card represents a specific metric with visual status indicators (chips) 
 * and icons for quick identification.
 * 
 * Metrics include:
 * - Active Clients
 * - Daily Scheduled Classes
 * - Pending Payments
 * - Total Income
 * - Total Expenses
 * - Net Balance (Profit/Loss)
 */
export default function DashboardStatsGrid({ stats }) {
  return (
    <section className="dashboard-stats-container" aria-label="Métricas Clave">
      
      {/* Active Clients Metric */}
      <article className="dashboard-stat-card">
        <div className="dashboard-stat-top">
          <span className="dashboard-stat-icon-wrapper icon-wrapper--primary">
            👥
          </span>
          <span className="dashboard-stat-chip dashboard-stat-chip--good">
            ACTIVO
          </span>
        </div>
        <p className="dashboard-stat-value">{stats.clientesActivos}</p>
        <p className="dashboard-stat-label">Clientes Totales</p>
      </article>

      {/* Daily Class Schedule Metric */}
      <article className="dashboard-stat-card">
        <div className="dashboard-stat-top">
          <span className="dashboard-stat-icon-wrapper icon-wrapper--primary">
            🏋️
          </span>
          <span className="dashboard-stat-chip">HOY</span>
        </div>
        <p className="dashboard-stat-value">{stats.clasesTotales}</p>
        <p className="dashboard-stat-label">Clases Programadas</p>
      </article>

      {/* Pending Financial Obligations Metric */}
      <article className="dashboard-stat-card">
        <div className="dashboard-stat-top">
          <span className="dashboard-stat-icon-wrapper icon-wrapper--bad">
            💳
          </span>
          <span className="dashboard-stat-chip dashboard-stat-chip--bad">
            PENDIENTE
          </span>
        </div>
        <p className="dashboard-stat-value">{stats.pagosPendientes}</p>
        <p className="dashboard-stat-label">Pagos Pendientes</p>
      </article>

      {/* Total Revenue Metric */}
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
        <p className="dashboard-stat-label">Ingreso Bruto</p>
      </article>

      {/* Operational Expenses Metric */}
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
        <p className="dashboard-stat-label">Gastos Totales</p>
      </article>

      {/* Featured Net Balance Metric */}
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
          {stats.balance >= 0 ? "Beneficio Neto" : "Pérdida Neta"}
        </p>
      </article>
    </section>
  );
}
