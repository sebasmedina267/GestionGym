import React from 'react';
import Modal from "../../components/ui/Modal";
import './Styles/PagosModals.css';

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
        <div className="pagos-modals-alert-container">
          <p className="pagos-modals-alert-message">
            {alertModal.message}
          </p>
          <button
            className="kinetic-btn-primary pagos-modals-alert-btn"
            onClick={() => setAlertModal({ ...alertModal, open: false })}
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
        <div className="pagos-modals-payment-container">
          {clientePendiente && (
            <div className="glass-card neon-glow-primary pagos-modals-cliente-card">
              <label className="label-caps pagos-modals-cliente-label">Cliente</label>
              <p className="pagos-modals-cliente-name">
                {clientePendiente.cliente_nombre} {clientePendiente.cliente_apellido}
              </p>
              <div className="pagos-modals-importe-wrapper">
                <span className="pagos-modals-importe-value">
                  €{Number(clasePrecio).toFixed(2)}
                </span>
                <span className="label-caps pagos-modals-importe-label">Importe Total</span>
              </div>
            </div>
          )}

          <div className="pagos-modals-metodo-container">
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

          <div className="pagos-modals-actions">
            <button
              className="kinetic-btn-primary pagos-modals-btn-cancel"
              onClick={() => {
                setShowMetodoModal(false);
                setClientePendiente(null);
              }}
            >
              Cancelar
            </button>
            <button
              className="kinetic-btn-primary pagos-modals-btn-confirm"
              onClick={handleConfirmarPago}
              disabled={pagando}
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
