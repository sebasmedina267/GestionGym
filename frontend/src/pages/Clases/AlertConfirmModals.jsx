import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

export function AlertModal({ open, title, message, onClose }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div style={{ textAlign: "center", minWidth: "280px" }}>
        <p style={{ color: "var(--text-primary)", marginBottom: "20px", lineHeight: "1.5" }}>{message}</p>
        <Button variant="primary" onClick={onClose} style={{ minWidth: "120px" }}>Entendido</Button>
      </div>
    </Modal>
  );
}

export function ConfirmModal({ open, title, message, onClose, onConfirm }) {
  return (
    <Modal open={open} onClose={onClose} title={title}>
      <div style={{ textAlign: "center", minWidth: "300px" }}>
        <p style={{ color: "var(--text-secondary)", marginBottom: "24px", lineHeight: "1.5" }}>{message}</p>
        <div style={{ display: "flex", gap: "12px", justifyContent: "center" }}>
          <Button variant="secondary" onClick={onClose} style={{ minWidth: "100px" }}>Cancelar</Button>
          <Button variant="primary" onClick={onConfirm} style={{ minWidth: "100px" }}>
            Confirmar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
