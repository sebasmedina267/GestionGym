import { ResponsiveContainer } from "recharts";
import "./Styles/StatsComponents.css";
export function StatBox({ label, value, color }) {
  return (
    <div className="stat-box">
      <p className="stat-label">{label}</p>
      <p className="stat-value" style={{ color }}>{value}</p>
    </div>
  );
}

export function ChartCard({ title, children }) {
  return (
    <div className="chart-card">
      <div className="chart-card-header">
        <span className="chart-card-accent" />
        <h4 className="chart-card-title">{title}</h4>
      </div>
      <div className="chart-content-wrapper">
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export default function StatsComponents({ stats, generoData, edadData }) {
  if (!stats) return (
    <div className="stats-loading">
      Analizando métricas...
    </div>
  );

  return (
    <div className="stats-container">
      {/* Mini metrics Grid */}
      <div className="metrics-mini-grid">
        <StatBox label="Total Inscripciones" value={stats.totalInscripciones} color="#bdc2ff" />
        <StatBox label="Promedio Asistencia" value="88%" color="#4edea3" />
        <StatBox label="Retención Mensual" value="94%" color="#bdc2ff" />
        <StatBox label="Capacidad Actual" value="76%" color="#4edea3" />
      </div>

      <div className="charts-grid">
        <ChartCard title="Distribución por Género">
          {/* Chart children will be injected here from the parent component */}
          <div style={{display: "flex", height: "100%", alignItems: "center", justifyContent: "center", opacity: 0.5}}>
            <span className="material-symbols-outlined" style={{fontSize: "2.5rem"}}>pie_chart</span>
          </div>
        </ChartCard>
        <ChartCard title="Distribución por Rango de Edad">
          <div style={{display: "flex", height: "100%", alignItems: "center", justifyContent: "center", opacity: 0.5}}>
            <span className="material-symbols-outlined" style={{fontSize: "2.5rem"}}>bar_chart</span>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
