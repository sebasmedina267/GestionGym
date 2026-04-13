import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import "./Styles/GymsNotifyModal.css";

export default function GymsNotifyModal({ notif, closeNotif }) {
  return (
    <Modal open={notif.open} onClose={closeNotif} title={notif.title}>
      <div className="gyms-notify-content">
        <p className="gyms-notify-message">
          {notif.message}
        </p>
        <Button variant="primary" onClick={closeNotif} className="gyms-notify-btn">
          Entendido
        </Button>
      </div>
    </Modal>
  );
}
