import React from "react";

const DIAS = ["Lun", "Mar", "Mie", "Jue", "Vie", "Sab", "Dom"];
const HORAS = Array.from({ length: 11 }, (_, i) => i + 8); // 8 AM a 6 PM

export default function HorarioCalendar({ horarios = [], onSelectHorario }) {
  // Organizar horarios por día y hora
  const organizarPorDiaHora = () => {
    const grid = {};
    
    horarios.forEach((horario) => {
      if (!horario.inicio || !horario.fin) return;
      
      const fechaInicio = new Date(horario.inicio);
      const fechaFin = new Date(horario.fin);
      
      let diaSemana = fechaInicio.getDay();
      diaSemana = diaSemana === 0 ? 6 : diaSemana - 1;
      
      const diaKey = DIAS[diaSemana];
      const horaInicio = fechaInicio.getHours();
      
      if (!grid[diaKey]) grid[diaKey] = {};
      if (!grid[diaKey][horaInicio]) grid[diaKey][horaInicio] = [];
      
      grid[diaKey][horaInicio].push({
        ...horario,
        hora_inicio: horaInicio,
        minuto_inicio: fechaInicio.getMinutes(),
        hora_fin: fechaFin.getHours(),
        minuto_fin: fechaFin.getMinutes()
      });
    });
    
    return grid;
  };

  const grid = organizarPorDiaHora();

  return (
    <div className="glass-card overflow-hidden border border-white/5">
      {/* Grid Headers */}
      <div className="grid grid-cols-8 border-b border-white/5 bg-white/5">
        <div className="p-4 border-r border-white/5"></div>
        {DIAS.map((dia) => (
          <div key={dia} className="p-4 text-center">
            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#bdc2ff]/60">
              {dia}
            </span>
          </div>
        ))}
      </div>

      {/* Grid Body */}
      <div className="grid grid-cols-1 divide-y divide-white/5">
        {HORAS.map((hora) => (
          <div key={hora} className="grid grid-cols-8 group">
            {/* Hour label */}
            <div className="p-4 border-r border-white/5 bg-white/5 flex items-center justify-center">
              <span className="text-[10px] font-bold text-white/40 group-hover:text-[#bdc2ff] transition-colors">
                {String(hora).padStart(2, '0')}:00
              </span>
            </div>

            {/* Day slots */}
            {DIAS.map((dia) => {
              const items = grid[dia]?.[hora] || [];
              return (
                <div 
                  key={`${dia}-${hora}`} 
                  className="p-1 min-h-[80px] border-r border-white/5 relative group/slot hover:bg-white/[0.02] transition-colors"
                >
                  {items.map((h, idx) => (
                    <div
                      key={`${h.id}-${idx}`}
                      onClick={() => onSelectHorario && onSelectHorario(h)}
                      className="absolute inset-x-1 p-2 rounded-lg cursor-pointer transition-all hover:scale-[1.02] active:scale-[0.98] z-10 overflow-hidden group/card shadow-lg"
                      style={{
                        top: `${(h.minuto_inicio / 60) * 100}%`,
                        height: '70px', // Fixed height for simplicity in this grid
                        background: 'linear-gradient(135deg, rgba(189, 194, 255, 0.15) 0%, rgba(189, 194, 255, 0.05) 100%)',
                        borderLeft: '3px solid #bdc2ff',
                        backdropFilter: 'blur(4px)'
                      }}
                      title={`${h.claseNombre || h.nombre || "Clase"}: ${String(h.hora_inicio).padStart(2, '0')}:${String(h.minuto_inicio).padStart(2, '0')} - ${String(h.hora_fin).padStart(2, '0')}:${String(h.minuto_fin).padStart(2, '0')}`}
                    >
                      <div className="relative">
                        <span className="text-[9px] font-black text-[#bdc2ff] uppercase block leading-none mb-1">
                          {String(h.hora_inicio).padStart(2, '0')}:{String(h.minuto_inicio).padStart(2, '0')}
                        </span>
                        <h4 className="text-[11px] font-bold text-white leading-tight truncate">
                          {h.claseNombre || h.nombre || "Clase"}
                        </h4>
                        <p className="text-[8px] text-white/40 mt-1 uppercase tracking-widest font-bold">
                          Slot Activo
                        </p>
                      </div>
                      
                      {/* Glow effect on hover */}
                      <div className="absolute inset-0 bg-[#bdc2ff]/10 opacity-0 group-hover/card:opacity-100 transition-opacity pointer-events-none" />
                    </div>
                  ))}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
