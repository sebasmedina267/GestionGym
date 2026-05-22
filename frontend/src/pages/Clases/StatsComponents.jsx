import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";
import "./Styles/StatsComponents.css";

const COLORS = ["#4edea3", "#ff5c72", "#bdc2ff", "#ffb800"];

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
          {generoData && generoData.length > 0 ? (
            <PieChart>
              <Pie
                data={generoData}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={80}
                paddingAngle={5}
                dataKey="value"
              >
                {generoData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  background: "#12192c",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                }}
                itemStyle={{ color: "#fff", fontSize: "12px" }}
              />
              <Legend
                verticalAlign="bottom"
                height={36}
                formatter={(value) => (
                  <span style={{ color: "rgba(189, 194, 255, 0.7)", fontSize: "11px", fontWeight: 600 }}>
                    {value}
                  </span>
                )}
              />
            </PieChart>
          ) : (
            <div className="chart-empty">Sin datos de género registrados</div>
          )}
        </ChartCard>

        <ChartCard title="Distribución por Rango de Edad">
          {edadData && edadData.length > 0 ? (
            <BarChart data={edadData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
              <XAxis
                dataKey="name"
                tick={{ fill: "rgba(189, 194, 255, 0.6)", fontSize: 10, fontWeight: 600 }}
                stroke="rgba(255,255,255,0.08)"
              />
              <YAxis
                tick={{ fill: "rgba(189, 194, 255, 0.6)", fontSize: 10, fontWeight: 600 }}
                stroke="rgba(255,255,255,0.08)"
              />
              <Tooltip
                contentStyle={{
                  background: "#12192c",
                  border: "1px solid rgba(255,255,255,0.08)",
                  borderRadius: "1rem",
                }}
                itemStyle={{ color: "#fff", fontSize: "12px" }}
                labelStyle={{ color: "#bdc2ff", fontWeight: 700 }}
              />
              <Bar dataKey="total" fill="#bdc2ff" radius={[4, 4, 0, 0]}>
                {edadData.map((entry, index) => (
                  <Cell
                    key={`cell-${index}`}
                    fill={entry.total > 5 ? "var(--primary)" : "var(--secondary)"}
                  />
                ))}
              </Bar>
            </BarChart>
          ) : (
            <div className="chart-empty">Sin datos de edad registrados</div>
          )}
        </ChartCard>
      </div>
    </div>
  );
}
