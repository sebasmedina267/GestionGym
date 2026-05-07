import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import "./Styles/ChartsSection.css";

// Authoritative color palette for high-fidelity data visualization
const COLORS = ["#4edea3", "#bdc2ff", "#ffb2b7", "#a78bfa", "#f59e0b"];

/**
 * ChartsSection Component
 * 
 * Provides a rich visual breakdown of the gym's financial health.
 * Features:
 * - Cash Flow Comparison (Bar Chart): Juxtaposes Income vs Expenses for the current period.
 * - Revenue Stream Distribution (Pie Chart): Identifies primary sources of income.
 * - Expense Allocation (Pie Chart): Visualizes where capital is being deployed.
 * 
 * Props:
 * @param {Object} resumen - Aggregate summary data.
 * @param {Array} ingresosFuentes - Grouped income data for pie chart.
 * @param {Array} gastosFuentes - Grouped expense data for pie chart.
 */
export default function ChartsSection({ resumen, ingresosFuentes, gastosFuentes }) {
  return (
    <div className="economia-info-section">
      
      {/* --- Main Analysis: Cash Flow Dynamics --- */}
      <div className="economia-info-card">
        <h3>Reporte de Inteligencia Fiscal</h3>
        <p className="economia-info-card-subtitle">Comparación Mensual de Flujo de Caja (Ingresos vs. Gastos Fijos)</p>
        <div id="main-economy-chart" className="economia-chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={[{ 
                name: "Periodo Actual", 
                Ingresos: Number(resumen.ingresos), 
                Gastos: Number(resumen.gastos) 
              }]}
              margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
            >
              <XAxis dataKey="name" stroke="#c6c5d5" tickLine={false} axisLine={false} />
              <YAxis stroke="#c6c5d5" tickLine={false} axisLine={false} />
              <Tooltip 
                cursor={{ fill: "rgba(189, 194, 255, 0.1)" }} 
                contentStyle={{ 
                  background: "#222a3d", 
                  border: "1px solid rgba(189, 194, 255, 0.1)", 
                  borderRadius: "8px", 
                  color: "#dae2fd" 
                }} 
              />
              <Legend iconType="circle" />
              <Bar dataKey="Ingresos" fill="#4edea3" radius={[8, 8, 0, 0]} barSize={50} />
              <Bar dataKey="Gastos" fill="#ffb2b7" radius={[8, 8, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- Granular Breakdown: Source Distribution --- */}
      <div className="economia-side-charts">
        
        {/* Module: Revenue Streams */}
        <div id="ingresos-pie-chart" className="economia-info-card">
          <h3>Asignación de Fuentes de Ingresos</h3>
          <p className="economia-info-card-subtitle">
            {ingresosFuentes.length > 0 
              ? `${ingresosFuentes.length} ${ingresosFuentes.length !== 1 ? 'fuentes activas' : 'fuente activa'}` 
              : 'No se encontraron registros de ingresos'}
          </p>
          {ingresosFuentes.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie 
                  data={ingresosFuentes} 
                  cx="50%" cy="50%" 
                  innerRadius={40} 
                  outerRadius={70} 
                  paddingAngle={2} 
                  dataKey="value"
                >
                  {ingresosFuentes.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: "#222a3d", 
                    border: "1px solid rgba(189, 194, 255, 0.1)", 
                    borderRadius: "8px", 
                    color: "#dae2fd" 
                  }} 
                />
                <Legend verticalAlign="bottom" height={18} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="economia-empty-state">
              <span className="material-symbols-outlined" style={{fontSize: "2rem"}}>bar_chart_4_bars</span>
              <p>Esperando sincronización de datos de ingresos...</p>
            </div>
          )}
        </div>

        {/* Module: Expense Categories */}
        <div id="gastos-pie-chart" className="economia-info-card">
          <h3>Asignación de Gastos Operativos</h3>
          <p className="economia-info-card-subtitle">
            {gastosFuentes.length > 0 
              ? `${gastosFuentes.length} ${gastosFuentes.length !== 1 ? 'centros de costos' : 'centro de costos'}` 
              : 'No se registraron gastos operativos'}
          </p>
          {gastosFuentes.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie 
                  data={gastosFuentes} 
                  cx="50%" cy="50%" 
                  innerRadius={40} 
                  outerRadius={70} 
                  paddingAngle={2} 
                  dataKey="value"
                >
                  {gastosFuentes.map((e, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    background: "#222a3d", 
                    border: "1px solid rgba(189, 194, 255, 0.1)", 
                    borderRadius: "8px", 
                    color: "#dae2fd" 
                  }} 
                />
                <Legend verticalAlign="bottom" height={18} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="economia-empty-state">
              <span className="material-symbols-outlined" style={{fontSize: "2rem"}}>analytics</span>
              <p>No hay gastos operativos registrados para este período.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}