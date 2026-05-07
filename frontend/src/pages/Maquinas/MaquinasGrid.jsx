import Button from "../../components/ui/Button";
import "./Styles/MaquinasGrid.css";

/**
 * EstadoBadge Component
 * 
 * Renders a visual status indicator with dynamic color coding based on the equipment state.
 * 
 * @param {Object} props - Component properties
 * @param {string} props.estado - The current state of the machine (e.g., 'Disponible', 'En Uso', 'Mantenimiento')
 */
const EstadoBadge = ({ estado }) => {
  const badgeClass = {
    "En Uso": "status-uso",
    "Disponible": "status-disponible",
    "Mantenimiento": "status-mantenimiento",
    "Operativa": "status-operativa"
  }[estado] || "status-disponible";

  return (
    <div className={`maquina-status-badge ${badgeClass}`}>
      <span className="status-label-kinetic">{estado || "Disponible"}</span>
    </div>
  );
};

/**
 * MaquinasGrid Component
 * 
 * Renders a high-density grid of machinery cards.
 * Features:
 * - Conditional image rendering (shows placeholder if no photo is available).
 * - Status and quantity overlays for quick identification.
 * - Interactive action triggers for editing and deletion.
 * - Responsive empty state handling.
 * 
 * @param {Object} props - Component properties
 * @param {Array} props.maquinas - List of machinery records to display
 * @param {Function} props.openEdit - Handler to trigger the edit modal
 * @param {Function} props.handleDelete - Handler to trigger the deletion confirmation
 */
export default function MaquinasGrid({ maquinas, openEdit, handleDelete }) {
  // Empty state guard: prevents rendering empty grid layouts
  if (!maquinas || maquinas.length === 0) {
    return (
      <div className="maquinas-empty-kinetic">
        <p className="empty-text-kinetic">No hay máquinas registradas en este gimnasio.</p>
      </div>
    );
  }

  return (
    <div className="maquinas-grid-list">
      {maquinas.map((maq) => (
        <div 
          key={maq.id} 
          className="maquina-card-kinetic"
        >
          {/* Aesthetic Asset Header: Displays machine photo with status/quantity overlays */}
          <div className="maquina-card-header">
            {maq.foto ? (
              <img 
                src={maq.foto} 
                alt={maq.nombre} 
                className="maquina-img-kinetic"
              />
            ) : (
              <div className="maquina-img-placeholder">
                <span className="material-symbols-outlined">fitness_center</span>
              </div>
            )}
            
            {/* Visual enhancement overlay for text readability over images */}
            <div className="maquina-card-overlay"></div>
            
            {/* Operational Status Indicator */}
            <EstadoBadge estado={maq.estado} />
            
            {/* Aggregate Inventory Level Badge */}
            <div className="maquina-qty-badge">
              <span className="qty-label-kinetic">X{maq.cantidad}</span>
            </div>
          </div>
          
          {/* Descriptive Content: Key machine identity and location data */}
          <div className="maquina-card-body">
            <div className="maquina-info-title">
              <h3 className="maquina-name-kinetic">
                {maq.nombre}
              </h3>
              <p className="maquina-usage-tag">
                {maq.uso || "General"}
              </p>
            </div>
            
            <div className="maquina-details-kinetic">
              {/* Placement data (Zoning within the gym) */}
              <div className="maquina-detail-row">
                <span className="detail-label-kinetic">Ubicación</span>
                <span className="detail-value-kinetic">{maq.ubicacion || "Sin asignar"}</span>
              </div>
              
              {/* Extended descriptive notes */}
              <div className="maquina-desc-wrapper">
                <span className="detail-label-kinetic">Descripción</span>
                <p className="maquina-desc-kinetic" title={maq.descripcion}>
                  {maq.descripcion || "Sin notas adicionales del equipo."}
                </p>
              </div>
            </div>

            {/* Operational Controls: Lifecycle actions for branch managers */}
            <div className="maquina-card-actions">
              <button 
                onClick={() => openEdit(maq)}
                className="btn-maquina-action btn-edit-maquina"
              >
                Editar
              </button>
              <button 
                onClick={() => handleDelete(maq.id)}
                className="btn-maquina-action btn-delete-maquina"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
