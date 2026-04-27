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
import './Styles/PagosResumen.css';

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
    <div className="pagos-resumen-container">
      {/* Summary Revenue Card */}
      <div className="glass-card neon-glow-primary pagos-resumen-card">
        <div className="pagos-resumen-bg-blur"></div>
        <label className="label-caps">Resumen de la Clase</label>
        <div className="pagos-resumen-amount-wrapper">
          <h2 className="pagos-resumen-amount">
            {classStats.totalPagado.toFixed(2)}
          </h2>
          <span className="pagos-resumen-currency">€</span>
        </div>
        
        <div className="pagos-resumen-stats-grid">
          <div className="pagos-resumen-stat-box">
            <p className="label-caps pagos-resumen-stat-label">Alumnos</p>
            <p className="pagos-resumen-stat-value">{classStats.totalAlumnos}</p>
          </div>
          <div className="pagos-resumen-stat-box debtors">
            <p className="label-caps pagos-resumen-stat-label debtors">Deudores</p>
            <p className="pagos-resumen-stat-value debtors">{classStats.pendientesCount}</p>
          </div>
        </div>
      </div>

      {/* Morosidad Donut Chart */}
      <div className="glass-card">
        <h4 className="label-caps pagos-resumen-chart-title">
          <span className="material-symbols-outlined pagos-resumen-chart-icon">pie_chart</span>
          Índice de Morosidad
        </h4>
        
        <div className="pagos-resumen-chart-container">
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
          
          <div className="pagos-resumen-chart-center">
            <span className={`pagos-resumen-percent ${classStats.totalAlumnos > 0 && classStats.pendientesCount === 0 ? 'success' : 'normal'}`}>
              {classStats.totalAlumnos > 0 ? 
                Math.round(((classStats.totalAlumnos - classStats.pendientesCount) / classStats.totalAlumnos) * 100) : 0}%
            </span>
            <p className="label-caps pagos-resumen-percent-label">Cobrado</p>
          </div>
        </div>
      </div>

      {/* Methods Bar Chart */}
      <div className="glass-card pagos-resumen-flex-1">
        <h4 className="label-caps pagos-resumen-chart-title">
          <span className="material-symbols-outlined pagos-resumen-chart-icon">bar_chart</span>
          Métodos de Pago
        </h4>
        
        <div className="pagos-resumen-bar-container">
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
