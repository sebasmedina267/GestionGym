import React from 'react';
import Modal from "../../components/ui/Modal";

const METODOS_PAGO = ['EFECTIVO', 'TARJETA', 'TRANSFERENCIA', 'CHEQUE', 'CRIPTOMONEDA'];

export default function PagosModals({
  alertModal,
  setAlertModal,
  showMetodoModal,
  setShowMetodoModal,
  clientePendiente,
  setClientePendiente,
  clasePrecio,
  metodoPago,
  setMetodoPago,
  handleConfirmarPago,
  pagando
}) {
  return (
    <>
      {/* Alert Modal */}
      <Modal
        open={alertModal.open}
        onClose={() => setAlertModal({ ...alertModal, open: false })}
        title={alertModal.title}
      >
        <div style={{ minWidth: "300px", textAlign: "center", padding: "1rem" }}>
          <p style={{ 
            fontSize: "1rem", 
            color: "var(--on-surface)", 
            marginBottom: "2rem",
            lineHeight: "1.6"
          }}>
            {alertModal.message}
          </p>
          <button
            className="kinetic-btn-primary"
            onClick={() => setAlertModal({ ...alertModal, open: false })}
            style={{ width: "auto", minWidth: "120px", padding: "0.75rem 2rem", margin: "0 auto" }}
          >
            Entendido
          </button>
        </div>
      </Modal>

      {/* Payment Selection Modal */}
      <Modal
        open={showMetodoModal}
        onClose={() => {
          setShowMetodoModal(false);
          setClientePendiente(null);
        }}
        title="Registrar Pago"
      >
        <div style={{ padding: "0.5rem" }}>
          {clientePendiente && (
            <div className="glass-card neon-glow-primary" style={{ 
              marginBottom: "1.5rem", 
              background: "rgba(129, 140, 248, 0.05)",
              border: "1px solid rgba(129, 140, 248, 0.2)"
            }}>
              <label className="label-caps" style={{ fontSize: "0.6rem" }}>Cliente</label>
              <p style={{ margin: "0 0 1rem 0", fontSize: "1.125rem", fontWeight: "800", color: "var(--on-surface)" }}>
                {clientePendiente.cliente_nombre} {clientePendiente.cliente_apellido}
              </p>
              <div style={{ display: "flex", alignItems: "baseline", gap: "0.5rem" }}>
                <span style={{ fontSize: "1.5rem", fontWeight: "900", color: "var(--secondary)" }}>
                  €{Number(clasePrecio).toFixed(2)}
                </span>
                <span className="label-caps" style={{ color: "var(--secondary)", margin: 0 }}>Importe Total</span>
              </div>
            </div>
          )}

          <div style={{ marginBottom: "2rem" }}>
            <label className="label-caps">Método de Pago</label>
            <select
              className="kinetic-select"
              value={metodoPago}
              onChange={(e) => setMetodoPago(e.target.value)}
            >
              {METODOS_PAGO.map((metodo) => (
                <option key={metodo} value={metodo}>
                  {metodo}
                </option>
              ))}
            </select>
          </div>

          <div style={{ display: "flex", gap: "1rem" }}>
            <button
              className="kinetic-btn-primary"
              style={{ 
                flex: 1, 
                background: "rgba(255, 255, 255, 0.05)", 
                color: "var(--on-surface-variant)",
                border: "1px solid rgba(189, 194, 255, 0.1)"
              }}
              onClick={() => {
                setShowMetodoModal(false);
                setClientePendiente(null);
              }}
            >
              Cancelar
            </button>
            <button
              className="kinetic-btn-primary"
              onClick={handleConfirmarPago}
              disabled={pagando}
              style={{ flex: 2, opacity: pagando ? 0.6 : 1 }}
            >
              {pagando ? (
                <>
                  <span className="material-symbols-outlined animate-spin">sync</span>
                  Procesando...
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined">payments</span>
                  Confirmar Pago
                </>
              )}
            </button>
          </div>
        </div>
      </Modal>
    </>
  );
}
