import React from "react";
import "./Styles/ResumenSection.css";

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

export default function ResumenSection({ resumen, calcMargin }) {
  return (
    <div className="economia-summary-grid">
      <ResumenCard label="Ingresos Totales" value={resumen.ingresos} badgeText="+12.4% vs prev." color="green" icon="📈" />
      <ResumenCard label="Gastos Totales" value={resumen.gastos} badgeText="-3.2% vs prev." color="red" icon="📉" />
      <ResumenCard label="Beneficio Neto" value={resumen.beneficios} badgeText={`${calcMargin()}% Margen`} color="purple" icon="💰" />
    </div>
  );
}