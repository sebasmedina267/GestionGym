import HorarioCalendar from "../../components/ui/HorarioCalendar";
import "./Styles/DashboardPanels.css";


export default function DashboardAgenda({ clases }) {
  return (
    <div className="dashboard-panel-kinetic">
      <div className="dashboard-panel-header">
        <div>
          <p className="dashboard-panel-kicker">Agenda</p>
          <h2 className="dashboard-panel-title">Calendario semanal de clases</h2>
        </div>
      </div>

      <div className="dashboard-panel-body">
        {Array.isArray(clases) && clases.length > 0 ? (
          <HorarioCalendar horarios={clases} />
        ) : (
          <div className="dashboard-empty-state">
            <p className="dashboard-empty-title">No hay clases programadas.</p>
            <p className="dashboard-empty-text">
              Ve a la sección de Clases para crear nuevas clases.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
