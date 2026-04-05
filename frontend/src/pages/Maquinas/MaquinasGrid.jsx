import Button from "../../components/ui/Button";

const EstadoBadge = ({ estado }) => {
  const styles = {
    "En Uso": "bg-secondary-container/80 text-white",
    "Disponible": "bg-secondary-container/80 text-white",
    "Mantenimiento": "bg-error-container/80 text-white",
    "Operativa": "bg-secondary-container/80 text-white"
  };

  const currentStyle = styles[estado] || "bg-surface-container-highest/80 text-primary";

  return (
    <div className={`absolute top-6 right-6 backdrop-blur-xl px-4 py-1.5 rounded-full flex items-center gap-1 shadow-lg ${currentStyle}`}>
      <span className="text-[10px] font-black uppercase tracking-widest">{estado || "Disponible"}</span>
    </div>
  );
};

export default function MaquinasGrid({ maquinas, openEdit, handleDelete }) {
  if (!maquinas || maquinas.length === 0) {
    return (
      <div className="glass-card rounded-[2rem] p-12 text-center mt-8">
        <p className="text-on-surface-variant font-medium text-lg">No hay máquinas registradas en este gimnasio.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10 mt-6">
      {maquinas.map((maq) => (
        <div 
          key={maq.id} 
          className="glass-card glass-card-hover rounded-[2rem] overflow-hidden flex flex-col group transition-all duration-700"
        >
          {/* Image Container */}
          <div className="relative h-64 overflow-hidden bg-surface-container-low">
            {maq.foto ? (
              <img 
                src={maq.foto} 
                alt={maq.nombre} 
                className="preview-img-kinetic group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-symbols-outlined text-6xl text-slate-700">fitness_center</span>
              </div>
            )}
            
            {/* Gradient Overlay - Deeper and more integrated */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0b1326] via-[#0b1326]/20 to-transparent"></div>
            
            {/* Status Badge */}
            <EstadoBadge estado={maq.estado} />
            
            {/* Quantity Badge - Floating Aesthetic */}
            <div className="absolute top-6 left-6 bg-surface-container-highest/80 backdrop-blur-xl px-4 py-1.5 rounded-full border border-white/10 shadow-lg">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">X{maq.cantidad}</span>
            </div>
          </div>
          
          {/* Content */}
          <div className="p-8 flex flex-col gap-6">
            <div className="flex flex-col gap-1">
              <h3 className="text-2xl font-black text-on-surface tracking-tighter group-hover:text-primary transition-colors duration-300">
                {maq.nombre}
              </h3>
              <p className="text-[12px] text-slate-500 uppercase tracking-[0.2em] font-bold">
                {maq.uso || "General"}
              </p>
            </div>
            
            <div className="flex flex-col gap-4">
              {/* Refined Label-Value Grid */}
              <div className="grid grid-cols-3 items-center text-sm">
                <span className="text-slate-400 font-semibold col-span-1">Ubicación</span>
                <span className="text-on-surface font-medium col-span-2 text-right">{maq.ubicacion || "Sin asignar"}</span>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-slate-400 font-semibold text-sm">Descripción</span>
                <p className="text-on-surface font-medium text-sm leading-relaxed line-clamp-3 min-h-[3rem]" title={maq.descripcion}>
                  {maq.descripcion || "Sin notas adicionales del equipo."}
                </p>
              </div>
            </div>

            {/* Actions - High Performance Style */}
            <div className="grid grid-cols-2 gap-4 mt-4">
              <button 
                onClick={() => openEdit(maq)}
                className="bg-surface-container-high hover:bg-surface-bright text-on-surface-variant text-sm font-bold py-4 rounded-2xl transition-all duration-300 border border-white/5 active:scale-95"
              >
                Editar
              </button>
              <button 
                onClick={() => handleDelete(maq.id)}
                className="bg-error/10 hover:bg-error/20 text-error text-sm font-bold py-4 rounded-2xl transition-all duration-300 border border-error/20 active:scale-95"
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
