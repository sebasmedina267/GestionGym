import { ResponsiveContainer } from "recharts";

export function StatBox({ label, value, color }) {
  return (
    <div className="glass-card p-6 flex flex-col items-center justify-center border border-white/5 group hover:border-primary/20 transition-all">
      <p className="kinetic-label mb-2 text-center">{label}</p>
      <p className="kinetic-display text-on-surface text-3xl md:text-4xl" style={{ color }}>{value}</p>
    </div>
  );
}

export function ChartCard({ title, children }) {
  return (
    <div className="glass-card p-6 border border-white/5 h-full">
      <h4 className="kinetic-label mb-6 text-on-surface-variant flex items-center gap-2">
        <span className="w-1 h-3 bg-secondary rounded-full" />
        {title}
      </h4>
      <div className="h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function StatsComponents({ stats, generoData, edadData }) {
  if (!stats) return (
    <div className="py-20 text-center animate-pulse text-[#bdc2ff] font-bold tracking-widest uppercase text-xs">
      Analizando métricas...
    </div>
  );

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Mini metrics Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatBox label="Total Inscripciones" value={stats.totalInscripciones} color="#bdc2ff" />
        <StatBox label="Promedio Asistencia" value="88%" color="#4edea3" />
        <StatBox label="Retención Mensual" value="94%" color="#bdc2ff" />
        <StatBox label="Capacidad Actual" value="76%" color="#4edea3" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartCard title="Distribución por Género">
          {/* Chart children will be injected here from the parent component */}
          <div className="flex h-full items-center justify-center opacity-50">
            <span className="material-symbols-outlined text-4xl">pie_chart</span>
          </div>
        </ChartCard>
        <ChartCard title="Distribución por Rango de Edad">
          <div className="flex h-full items-center justify-center opacity-50">
            <span className="material-symbols-outlined text-4xl">bar_chart</span>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
