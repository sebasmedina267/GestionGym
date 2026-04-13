// ChartsSection.jsx
import React from "react";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, PieChart, Pie, Cell } from "recharts";
import "./Styles/ChartsSection.css";

const COLORS = ["#4edea3", "#bdc2ff", "#ffb2b7", "#a78bfa", "#f59e0b"];

export default function ChartsSection({ resumen, ingresosFuentes, gastosFuentes }) {
  return (
    <div className="economia-info-section">
      {/* Main Chart */}
      <div className="economia-info-card">
        <h3>Informe Económico</h3>
        <p className="economia-info-card-subtitle">Comparativa Mensual de Flujos de Caja</p>
        <div className="economia-chart-container">
          <ResponsiveContainer width="100%" height={320}>
            <BarChart 
              data={[{ name: "Período Actual", Ingresos: Number(resumen.ingresos), Gastos: Number(resumen.gastos) }]}
              margin={{ top: 20, right: 0, left: 0, bottom: 20 }}
            >
              <XAxis dataKey="name" stroke="#c6c5d5" tickLine={false} axisLine={false} />
              <YAxis stroke="#c6c5d5" tickLine={false} axisLine={false} />
              <Tooltip cursor={{ fill: "rgba(189, 194, 255, 0.1)" }} contentStyle={{ background: "#222a3d", border: "1px solid rgba(189, 194, 255, 0.1)", borderRadius: "8px", color: "#dae2fd" }} />
              <Legend iconType="circle" />
              <Bar dataKey="Ingresos" fill="#4edea3" radius={[8, 8, 0, 0]} barSize={50} />
              <Bar dataKey="Gastos" fill="#ffb2b7" radius={[8, 8, 0, 0]} barSize={50} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Side Charts */}
      <div className="economia-side-charts">
        {/* Ingresos */}
        <div className="economia-info-card">
          <h3>Fuentes de Ingreso</h3>
          <p className="economia-info-card-subtitle">{ingresosFuentes.length > 0 ? `${ingresosFuentes.length} fuente${ingresosFuentes.length !== 1 ? 's' : ''}` : 'Sin ingresos'}</p>
          {ingresosFuentes.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={ingresosFuentes} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                  {ingresosFuentes.map((e, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#222a3d", border: "1px solid rgba(189, 194, 255, 0.1)", borderRadius: "8px", color: "#dae2fd" }} />
                <Legend verticalAlign="bottom" height={18} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="economia-empty-state">📊 Aún no hay ingresos registrados</div>}
        </div>

        {/* Gastos */}
        <div className="economia-info-card">
          <h3>Fuentes de Gasto</h3>
          <p className="economia-info-card-subtitle">{gastosFuentes.length > 0 ? `${gastosFuentes.length} fuente${gastosFuentes.length !== 1 ? 's' : ''}` : 'Sin gastos'}</p>
          {gastosFuentes.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <PieChart>
                <Pie data={gastosFuentes} cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={2} dataKey="value">
                  {gastosFuentes.map((e, i) => <Cell key={i} fill={COLORS[(i + 2) % COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#222a3d", border: "1px solid rgba(189, 194, 255, 0.1)", borderRadius: "8px", color: "#dae2fd" }} />
                <Legend verticalAlign="bottom" height={18} />
              </PieChart>
            </ResponsiveContainer>
          ) : <div className="economia-empty-state">📊 Aún no hay gastos registrados</div>}
        </div>
      </div>
    </div>
  );
}