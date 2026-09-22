import "./Styles/DashboardPanels.css";

/**
 * DashboardInsights Component
 * 
 * Provides automated business intelligence and actionable advice 
 * based on current operational statistics.
 */
export default function DashboardInsights({ stats }) {
  return (
    <aside className="dashboard-panel-kinetic">
      {/* Header: Displays status summary and a quantitative badge */}
      <div className="dashboard-panel-header">
        <div>
          <p className="dashboard-panel-kicker">Estado de Cuenta</p>
          <h2 className="dashboard-panel-title">Pagos Pendientes</h2>
        </div>
        <span className="dashboard-panel-pill">
          {stats.pagosPendientes} Acción Requerida
        </span>
      </div>

      {/* 
        Panel Body:
        Contains high-value insights or warnings derived from gym data.
      */}
      <div className="dashboard-panel-body">
        <div className="dashboard-insight-card">
          <p className="dashboard-insight-kicker">Información de Gestión</p>
          <p className="dashboard-insight-text">
            Prioriza la resolución de pagos atrasados para minimizar el riesgo financiero y optimizar tu flujo de caja operativo.
          </p>
          
          {stats.pagosPendientes > 0 && (
            <div className="dashboard-insight-list" style={{ marginTop: '1rem' }}>
              <p className="dashboard-insight-kicker" style={{ marginBottom: '0.5rem' }}>Detalle de Deudores</p>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                {stats.pagosPendientesList?.slice(0, 5).map((pago) => (
                  <li key={pago.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.25rem 0', borderBottom: '1px solid var(--border-color)' }}>
                    <span>{pago.cliente_nombre} {pago.cliente_apellido}</span>
                    <span style={{ 
                      fontSize: '0.75rem', 
                      padding: '2px 6px', 
                      borderRadius: '4px', 
                      background: pago.tipo_cliente === 'APP' ? 'var(--primary-color)' : 'var(--bg-card)',
                      color: pago.tipo_cliente === 'APP' ? '#fff' : 'inherit'
                    }}>
                      {pago.tipo_cliente || 'NATIVO'}
                    </span>
                  </li>
                ))}
                {stats.pagosPendientes > 5 && (
                  <li style={{ textAlign: 'center', paddingTop: '0.5rem', fontSize: '0.8rem' }}>
                    + {stats.pagosPendientes - 5} más...
                  </li>
                )}
              </ul>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
