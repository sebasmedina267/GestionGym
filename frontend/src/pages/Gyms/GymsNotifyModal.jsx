import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

export default function GymsNotifyModal({ notif, closeNotif }) {
  return (
    <Modal open={notif.open} onClose={closeNotif} title={notif.title}>
      <div style={{ textAlign: "center", minWidth: "280px" }}>
        <p style={{ fontSize: "1rem", color: "var(--text-primary)", marginBottom: "20px", lineHeight: "1.5" }}>
          {notif.message}
        </p>
        <Button variant="primary" onClick={closeNotif} style={{ minWidth: "120px" }}>
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
