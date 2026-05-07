import HorarioCalendar from "../../components/ui/HorarioCalendar";
import "./Styles/DashboardPanels.css";

/**
 * DashboardAgenda Component
 * 
 * Visualizes the weekly class schedule using a specialized calendar component.
 * Provides an empty state prompt if no classes are currently scheduled.
 */
export default function DashboardAgenda({ clases }) {
  return (
    <div className="dashboard-panel-kinetic">
      {/* Section Header: Identifies the purpose of the panel */}
      <div className="dashboard-panel-header">
        <div>
          <p className="dashboard-panel-kicker">Agenda</p>
          <h2 className="dashboard-panel-title">Horario Semanal de Clases</h2>
        </div>
      </div>

      {/* 
        Panel Body:
        Renders the calendar if data exists, otherwise displays guidance for the user.
      */}
      <div className="dashboard-panel-body">
        {Array.isArray(clases) && clases.length > 0 ? (
          <HorarioCalendar horarios={clases} />
        ) : (
          <div className="dashboard-empty-state">
            <p className="dashboard-empty-title">Aún no hay clases programadas.</p>
            <p className="dashboard-empty-text">
              Navega a la sección de Clases para comenzar a construir tu horario semanal.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
