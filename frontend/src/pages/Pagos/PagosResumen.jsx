import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Cell as BarCell,
} from "recharts";

const COLORS = ["#4edea3", "#ffb2b7", "#ff5c72"]; // Pagado, Pendiente, Otros

export default function PagosResumen({
  classStats,
  metodoPagoStats,
  chartData
}) {
  const displayChartData = chartData.length > 0 ? chartData : [
    { name: 'Sin Datos', value: 1 }
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: "1.5rem" }}>
      {/* Summary Revenue Card */}
      <div className="glass-card neon-glow-primary" style={{ 
        position: "relative", overflow: "hidden", padding: "2rem" 
      }}>
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#818cf8]/10 rounded-full blur-3xl pointer-events-none"></div>
        <label className="label-caps">Resumen de la Clase</label>
        <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <h2 style={{ fontSize: "2.5rem", margin: 0, color: "var(--on-surface)" }}>
            {classStats.totalPagado.toFixed(2)}
          </h2>
          <span style={{ fontSize: "1.25rem", fontWeight: "700", color: "var(--primary)" }}>€</span>
        </div>
        
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1rem" }}>
          <div style={{ background: "rgba(189, 194, 255, 0.05)", padding: "1rem", borderRadius: "0.75rem" }}>
            <p className="label-caps" style={{ fontSize: "0.6rem", marginBottom: "0.25rem" }}>Alumnos</p>
            <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: "900" }}>{classStats.totalAlumnos}</p>
          </div>
          <div style={{ background: "rgba(255, 178, 183, 0.05)", padding: "1rem", borderRadius: "0.75rem" }}>
            <p className="label-caps" style={{ fontSize: "0.6rem", marginBottom: "0.25rem", color: "var(--tertiary)" }}>Deudores</p>
            <p style={{ margin: 0, fontSize: "1.25rem", fontWeight: "900", color: "var(--tertiary)" }}>{classStats.pendientesCount}</p>
          </div>
        </div>
      </div>

      {/* Morosidad Donut Chart */}
      <div className="glass-card">
        <h4 className="label-caps" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>pie_chart</span>
          Índice de Morosidad
        </h4>
        
        <div style={{ height: "200px", position: "relative" }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie 
                data={displayChartData} 
                cx="50%" 
                cy="50%" 
                innerRadius="65%" 
                outerRadius="90%" 
                paddingAngle={8} 
                dataKey="value"
                stroke="none"
              >
                {displayChartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ background: "var(--surface-container-high)", border: "none", borderRadius: "10px", color: "#fff" }}
                itemStyle={{ color: "#fff" }}
              />
            </PieChart>
          </ResponsiveContainer>
          
          <div style={{
            position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)",
            textAlign: "center", pointerEvents: "none"
          }}>
            <span style={{ 
              fontSize: "1.5rem", 
              fontWeight: "900", 
              color: classStats.totalAlumnos > 0 && classStats.pendientesCount === 0 ? "var(--secondary)" : "var(--primary)"
            }}>
              {classStats.totalAlumnos > 0 ? 
                Math.round(((classStats.totalAlumnos - classStats.pendientesCount) / classStats.totalAlumnos) * 100) : 0}%
            </span>
            <p className="label-caps" style={{ fontSize: "0.5rem", margin: 0 }}>Cobrado</p>
          </div>
        </div>
      </div>

      {/* Methods Bar Chart */}
      <div className="glass-card" style={{ flex: 1 }}>
        <h4 className="label-caps" style={{ display: "flex", alignItems: "center", gap: "0.5rem", marginBottom: "1.5rem" }}>
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>bar_chart</span>
          Métodos de Pago
        </h4>
        
        <div style={{ height: "180px" }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metodoPagoStats} layout="vertical" margin={{ left: -15, right: 10 }}>
              <XAxis type="number" hide />
              <YAxis 
                dataKey="name" 
                type="category" 
                tick={{ fill: "rgba(189, 194, 255, 0.7)", fontSize: 10, fontWeight: 700 }}
                width={120}
                axisLine={false}
                tickLine={false}
              />
              <Tooltip 
                contentStyle={{ background: "var(--surface-container-high)", border: "none", borderRadius: "10px" }}
                cursor={{ fill: "rgba(129, 140, 248, 0.1)" }}
              />
              <Bar dataKey="cantidad" radius={[0, 10, 10, 0]} barSize={20}>
                {metodoPagoStats.map((entry, index) => (
                  <BarCell key={`cell-${index}`} fill={index === 0 ? "var(--primary-container)" : "var(--secondary)"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <button className="kinetic-btn-primary">
        <span className="material-symbols-outlined">download</span>
        Descargar Reporte
      </button>
    </div>
  );
}
