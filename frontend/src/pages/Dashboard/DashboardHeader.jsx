import "./Styles/DashboardHeader.css";

export default function DashboardHeader({ gym }) {
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
        <button
          className="dashboard-hero-btn dashboard-hero-btn--ghost"
          type="button"
        >
          Exportar
        </button>
        <button
          className="dashboard-hero-btn dashboard-hero-btn--primary"
          type="button"
        >
          Sincronizar
        </button>
      </div>
    </header>
  );
}
