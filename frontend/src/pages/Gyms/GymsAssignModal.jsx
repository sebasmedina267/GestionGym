import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import "./Styles/GymsAssignModal.css";

export default function GymsAssignModal({
  open,
  onClose,
  assignForm,
  setAssignForm,
  errors,
  setErrors,
  handleAssignGym,
  saving,
  availableGyms
}) {
  return (
    <Modal open={open} onClose={() => { onClose(); setErrors({}); }} title="Asignar Gimnasio">
      <div className="gyms-assign-field">
        <label className="gyms-assign-label">
          Selecciona un Gimnasio
        </label>
        <select
          value={assignForm.gymId}
          onChange={(e) => { setAssignForm({ gymId: e.target.value }); setErrors({}); }}
          className={`gyms-assign-select ${errors.gymId ? "gyms-assign-select--error" : ""}`}
        >
          <option value="">-- Selecciona un gimnasio --</option>
          {availableGyms.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}{g.ciudad ? ` — ${g.ciudad}` : ""}
            </option>
          ))}
        </select>
        {errors.gymId && <p className="gyms-assign-error">{errors.gymId}</p>}
      </div>
      <Button variant="primary" loading={saving} onClick={handleAssignGym} className="gyms-assign-btn">
        Asignar
      </Button>
    </Modal>
  );
}
