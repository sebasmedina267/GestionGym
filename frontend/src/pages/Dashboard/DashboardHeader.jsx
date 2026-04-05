export default function DashboardHeader({ gym }) {
  return (
    <header className="dashboard-v2__hero">
      <div>
        <p className="dashboard-v2__kicker">Panel de control</p>
        <h1 className="dashboard-v2__title">
          {gym?.nombre ? `Resumen — ${gym.nombre}` : "Resumen general"}
        </h1>
        <p className="dashboard-v2__subtitle">
          Métricas clave, agenda de clases y estado financiero.
        </p>
      </div>
      <div className="dashboard-v2__heroActions">
        <button
          className="dashboard-v2__btn dashboard-v2__btn--ghost"
          type="button"
        >
          Exportar
        </button>
        <button
          className="dashboard-v2__btn dashboard-v2__btn--primary"
          type="button"
        >
          Sincronizar
        </button>
      </div>
    </header>
  );
}
