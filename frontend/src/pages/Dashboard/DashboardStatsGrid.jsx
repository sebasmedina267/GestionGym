export default function DashboardStatsGrid({ stats }) {
  return (
    <section className="dashboard-v2__bento" aria-label="Métricas">
      <article className="dashboard-v2__statCard">
        <div className="dashboard-v2__statTop">
          <span className="dashboard-v2__statIcon dashboard-v2__statIcon--primary">
            👥
          </span>
          <span className="dashboard-v2__statChip dashboard-v2__statChip--good">
            ACTIVOS
          </span>
        </div>
        <p className="dashboard-v2__statValue">{stats.clientesActivos}</p>
        <p className="dashboard-v2__statLabel">Clientes</p>
      </article>

      <article className="dashboard-v2__statCard">
        <div className="dashboard-v2__statTop">
          <span className="dashboard-v2__statIcon dashboard-v2__statIcon--primary">
            🏋️
          </span>
          <span className="dashboard-v2__statChip">HOY</span>
        </div>
        <p className="dashboard-v2__statValue">{stats.clasesTotales}</p>
        <p className="dashboard-v2__statLabel">Clases programadas</p>
      </article>

      <article className="dashboard-v2__statCard">
        <div className="dashboard-v2__statTop">
          <span className="dashboard-v2__statIcon dashboard-v2__statIcon--bad">
            💳
          </span>
          <span className="dashboard-v2__statChip dashboard-v2__statChip--bad">
            PENDIENTES
          </span>
        </div>
        <p className="dashboard-v2__statValue">{stats.pagosPendientes}</p>
        <p className="dashboard-v2__statLabel">Pagos por procesar</p>
      </article>

      <article className="dashboard-v2__statCard">
        <div className="dashboard-v2__statTop">
          <span className="dashboard-v2__statIcon dashboard-v2__statIcon--good">
            📈
          </span>
          <span className="dashboard-v2__statChip dashboard-v2__statChip--good">
            INGRESOS
          </span>
        </div>
        <p className="dashboard-v2__statValue">
          €{stats.ingresos.toFixed(2)}
        </p>
        <p className="dashboard-v2__statLabel">Total</p>
      </article>

      <article className="dashboard-v2__statCard">
        <div className="dashboard-v2__statTop">
          <span className="dashboard-v2__statIcon dashboard-v2__statIcon--bad">
            📉
          </span>
          <span className="dashboard-v2__statChip dashboard-v2__statChip--bad">
            GASTOS
          </span>
        </div>
        <p className="dashboard-v2__statValue">
          €{stats.gastos.toFixed(2)}
        </p>
        <p className="dashboard-v2__statLabel">Total</p>
      </article>

      <article className="dashboard-v2__statCard dashboard-v2__statCard--featured">
        <div className="dashboard-v2__statTop">
          <span className="dashboard-v2__statIcon dashboard-v2__statIcon--primary">
            ⚖️
          </span>
          <span
            className={[
              "dashboard-v2__statChip",
              stats.balance >= 0
                ? "dashboard-v2__statChip--good"
                : "dashboard-v2__statChip--bad",
            ].join(" ")}
          >
            BALANCE
          </span>
        </div>
        <p className="dashboard-v2__statValue">
          €{stats.balance.toFixed(2)}
        </p>
        <p className="dashboard-v2__statLabel">
          {stats.balance >= 0 ? "Beneficio neto" : "Pérdida neta"}
        </p>
      </article>
    </section>
  );
}
