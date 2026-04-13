import Button from "../../components/ui/Button";
import "./Styles/MaquinasGrid.css";

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

export default function MaquinasGrid({ maquinas, openEdit, handleDelete }) {
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
          {/* Image Container */}
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
            
            {/* Gradient Overlay */}
            <div className="maquina-card-overlay"></div>
            
            {/* Status Badge */}
            <EstadoBadge estado={maq.estado} />
            
            {/* Quantity Badge */}
            <div className="maquina-qty-badge">
              <span className="qty-label-kinetic">X{maq.cantidad}</span>
            </div>
          </div>
          
          {/* Content */}
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
              <div className="maquina-detail-row">
                <span className="detail-label-kinetic">Ubicación</span>
                <span className="detail-value-kinetic">{maq.ubicacion || "Sin asignar"}</span>
              </div>
              <div className="maquina-desc-wrapper">
                <span className="detail-label-kinetic">Descripción</span>
                <p className="maquina-desc-kinetic" title={maq.descripcion}>
                  {maq.descripcion || "Sin notas adicionales del equipo."}
                </p>
              </div>
            </div>

            {/* Actions */}
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
