import HorarioCalendar from "../../components/ui/HorarioCalendar";

export default function DashboardAgenda({ clases }) {
  return (
    <div className="dashboard-v2__panel dashboard-v2__panel--wide">
      <div className="dashboard-v2__panelHeader">
        <div>
          <p className="dashboard-v2__panelKicker">Agenda</p>
          <h2 className="dashboard-v2__panelTitle">Calendario semanal de clases</h2>
        </div>
      </div>

      <div className="dashboard-v2__panelBody">
        {Array.isArray(clases) && clases.length > 0 ? (
          <HorarioCalendar horarios={clases} />
        ) : (
          <div className="dashboard-v2__empty">
            <p className="dashboard-v2__emptyTitle">No hay clases programadas.</p>
            <p className="dashboard-v2__emptyText">
              Ve a la sección de Clases para crear nuevas clases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
