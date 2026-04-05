import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";

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
      <div style={{ marginBottom: "16px" }}>
        <label style={{ display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "0.85rem" }}>
          Selecciona un Gimnasio
        </label>
        <select
          value={assignForm.gymId}
          onChange={(e) => { setAssignForm({ gymId: e.target.value }); setErrors({}); }}
          style={{
            width: "100%", padding: "12px", borderRadius: "8px",
            background: "var(--bg-tertiary)", color: "var(--text-primary)",
            border: errors.gymId ? "2px solid var(--danger-color)" : "1px solid var(--border-color)"
          }}
        >
          <option value="">-- Selecciona un gimnasio --</option>
          {availableGyms.map((g) => (
            <option key={g.id} value={g.id}>
              {g.nombre}{g.ciudad ? ` — ${g.ciudad}` : ""}
            </option>
          ))}
        </select>
        {errors.gymId && <p style={{ color: "var(--danger-color)", fontSize: "0.85rem", marginTop: "4px" }}>{errors.gymId}</p>}
      </div>
      <Button variant="primary" loading={saving} onClick={handleAssignGym} style={{ width: "100%" }}>
        Asignar
      </Button>
    </Modal>
  );
}
