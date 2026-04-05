import React from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import styles from "../../styles/ProductosPage.module.css";

export default function FinanzasTab({ chartData, movimientos }) {
  return (
    <div className={styles.finanzasContainer}>
      {/* LEFT: Gráfico in Capsule Card */}
      <div className={styles.chartCard} style={{overflow: 'hidden'}}>
        <h3 className={styles.chartTitle}>
          <span className="material-symbols-outlined" style={{color: 'var(--p-primary)'}}>monitoring</span>
          Top Retailers: Ingresos vs Gastos
        </h3>
        
        {chartData.length === 0 ? (
          <div className={styles.loading} style={{height: '300px'}}>No hay datos suficientes para graficar.</div>
        ) : (
          <div style={{height: "400px", padding: '0 10px'}}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{top: 10, right: 10, left: -20, bottom: 5}}>
                <XAxis 
                  dataKey="name" 
                  stroke="var(--p-on-surface-variant)" 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={11}
                  fontWeight={600}
                />
                <YAxis 
                  stroke="var(--p-on-surface-variant)" 
                  tickLine={false} 
                  axisLine={false} 
                  fontSize={11}
                  fontWeight={600}
                />
                <Tooltip 
                  cursor={{fill: "rgba(255,255,255,0.03)"}} 
                  contentStyle={{
                    background: "rgba(11, 19, 38, 0.95)", 
                    border: "1px solid rgba(255,255,255,0.1)", 
                    borderRadius: "1.5rem",
                    backdropFilter: "blur(20px)",
                    boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
                    padding: '12px 16px'
                  }}
                  itemStyle={{fontWeight: 700}}
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  height={50}
                  iconType="circle"
                  formatter={(value) => <span style={{ color: 'var(--p-on-surface-variant)', fontSize: '12px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em' }}>{value}</span>}
                />
                <Bar 
                  dataKey="ingresos" 
                  name="Ventas" 
                  fill="var(--p-secondary)" 
                  radius={[12, 12, 0, 0]} 
                  barSize={36}
                />
                <Bar 
                  dataKey="gastos" 
                  name="Compras" 
                  fill="var(--p-tertiary)" 
                  radius={[12, 12, 0, 0]} 
                  barSize={36}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* RIGHT: Historial in Capsule Card */}
      <div className={styles.historyCard}>
        <h3 className={styles.chartTitle}>
          <span className="material-symbols-outlined" style={{color: 'var(--p-primary)'}}>history</span>
          Actividad
        </h3>
        
        {!movimientos || movimientos.length === 0 ? (
          <p className={styles.loading} style={{fontSize: '0.8rem'}}>Sin historial registrado.</p>
        ) : (
          <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
            {movimientos.slice(0, 15).map(m => (
              <div 
                key={m.id} 
                className={`${styles.historyItem} ${m.tipo_movimiento === "VENTA" ? styles.historyItemVenta : styles.historyItemCompra}`}
              >
                <div style={{display: "flex", justifyContent: "space-between", marginBottom: "8px"}}>
                  <span style={{fontWeight: "850", fontSize: "1rem", color: "var(--p-on-surface)", letterSpacing: '-0.02em'}}>
                    {m.producto_nombre}
                  </span>
                  <span style={{color: "var(--p-primary)", fontSize: "0.7rem", fontWeight: "900", textTransform: 'uppercase'}}>
                    {new Date(m.fecha).toLocaleDateString()}
                  </span>
                </div>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: 'flex-end'}}>
                  <span style={{color: "var(--p-on-surface-variant)", fontSize: "0.7rem", fontWeight: '800', textTransform: 'uppercase', letterSpacing: '0.1em'}}>
                    {m.tipo_movimiento} • {m.cantidad} UDS
                  </span>
                  <span style={{
                    color: m.tipo_movimiento === "VENTA" ? "var(--p-secondary)" : "var(--p-tertiary)", 
                    fontWeight: "950",
                    fontSize: "1.15rem",
                    textShadow: `0 0 10px ${m.tipo_movimiento === "VENTA" ? 'rgba(78, 222, 163, 0.2)' : 'rgba(255, 178, 183, 0.2)'}`
                  }}>
                    {m.tipo_movimiento === "VENTA" ? "+" : "-"}{(Number(m.cantidad) * Number(m.precio_unitario)).toFixed(2)} €
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
