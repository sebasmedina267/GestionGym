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
import "./Styles/FinanzasTab.css";


export default function FinanzasTab({ chartData, movimientos }) {
  return (
    <div className="finanzasContainer">
      {/* LEFT: Gráfico in Capsule Card */}
      <div className={`chartCard overflowHidden`}>
        <h3 className="chartTitle">
          <span className={`material-symbols-outlined pPrimaryIcon`}>monitoring</span>
          Top Retailers: Ingresos vs Gastos
        </h3>
        
        {chartData.length === 0 ? (
          <div className={`loading noDataState`}>No hay datos suficientes para graficar.</div>
        ) : (
          <div className="chartWrapper">
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
                  contentStyle={{}}
                  wrapperClassName="chartTooltip"
                  itemStyle={{ fontWeight: 700 }}
                  className="tooltipItem"
                />
                <Legend 
                  verticalAlign="top" 
                  align="right" 
                  height={50}
                  iconType="circle"
                  formatter={(value) => <span className="legendLabel">{value}</span>}
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
      <div className="historyCard">
        <h3 className="chartTitle">
          <span className={`material-symbols-outlined pPrimaryIcon`}>history</span>
          Actividad
        </h3>
        
        {!movimientos || movimientos.length === 0 ? (
          <p className={`loading noDataSmall`}>Sin historial registrado.</p>
        ) : (
          <div className="historyList">
            {movimientos.slice(0, 15).map(m => (
              <div 
                key={m.id} 
                className={`historyItem ${m.tipo_movimiento === "VENTA" ? "historyItemVenta" : "historyItemCompra"}`}
              >
                <div className="historyItemHeader">
                  <span className="historyItemProdName">
                    {m.producto_nombre}
                  </span>
                  <span className="historyItemDate">
                    {new Date(m.fecha).toLocaleDateString()}
                  </span>
                </div>
                <div className="historyItemBody">
                  <span className="historyItemMeta">
                    {m.tipo_movimiento} • {m.cantidad} UDS
                  </span>
                  <span className={`historyItemAmount ${m.tipo_movimiento === "VENTA" ? "amountVenta" : "amountCompra"}`}>
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

