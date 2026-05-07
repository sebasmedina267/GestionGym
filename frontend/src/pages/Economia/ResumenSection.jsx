import React from "react";
import "./Styles/ResumenSection.css";

/**
 * ResumenCard Sub-component
 * Renders a high-density "Glassmorphism" card for a single financial metric.
 */
const ResumenCard = ({ label, value, badgeText, color, icon }) => (
  <div className="glass-card">
    <div className={`glass-card-blur ${color}`}></div>
    <div className="glass-card-content">
      <div className="glass-card-badge">
        <div className={`glass-card-badge-icon ${color}`}>{icon}</div>
        <span className={`glass-card-badge-text ${color}`}>{badgeText}</span>
      </div>
      <p className="glass-card-label">{label}</p>
      <p className={`glass-card-value ${color}`}>${Number(value).toFixed(2)}</p>
    </div>
  </div>
);

/**
 * ResumenSection Component
 * 
 * Displays the primary financial Key Performance Indicators (KPIs) in a responsive grid.
 * Metrics include total revenue, operational costs, and bottom-line profit.
 * 
 * Props:
 * @param {Object} resumen - Aggregate financial data (ingresos, gastos, beneficios).
 * @param {Function} calcMargin - Callback to calculate the current profit margin percentage.
 */
export default function ResumenSection({ resumen, calcMargin }) {
  return (
    <div className="economia-summary-grid">
      <ResumenCard 
        label="Ingresos Totales" 
        value={resumen.ingresos} 
        badgeText="+12.4% vs ant." 
        color="green" 
        icon="📈" 
      />
      <ResumenCard 
        label="Gastos Operativos" 
        value={resumen.gastos} 
        badgeText="-3.2% vs ant." 
        color="red" 
        icon="📉" 
      />
      <ResumenCard 
        label="Beneficio Neto" 
        value={resumen.beneficios} 
        badgeText={`${calcMargin()}% Margen`} 
        color="purple" 
        icon="💰" 
      />
    </div>
  );
}