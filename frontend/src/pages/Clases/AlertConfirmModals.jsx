import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import "./Styles/AlertConfirmModals.css";

export function AlertModal({ open, title, message, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="alert-modal-content">
        <p className="alert-modal-message">{message}</p>
        <Button variant="primary" onClick={onClose} className="alert-modal-btn">Entendido</Button>
      </div>
    </Modal>
  );
}

export function ConfirmModal({ open, title, message, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div className="confirm-modal-content">
        <p className="confirm-modal-message">{message}</p>
        <div className="confirm-modal-actions">
          <Button variant="secondary" onClick={onClose} className="confirm-modal-btn">Cancelar</Button>
          <Button variant="primary" onClick={onConfirm} className="confirm-modal-btn">
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
