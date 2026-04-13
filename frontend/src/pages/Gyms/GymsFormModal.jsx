import Modal from "../../components/ui/Modal";
import Button from "../../components/ui/Button";
import GymForm from "./GymForm";
import "./Styles/GymsFormModal.css";

export default function GymsFormModal({
  open,
  onClose,
  title,
  form,
  setForm,
  errors,
  setErrors,
  onSubmit,
  saving,
  submitText
}) {
  return (
    <Modal 
      open={open} 
      onClose={() => { onClose(); setErrors({}); }}
      clean
    >
      <div className="gyms-form-container">
        <div className="gyms-modal-header">
          <div className="gyms-modal-title-area">
            <h2>{title}</h2>
            <p className="gyms-modal-subtitle">Configure los detalles de su nueva locación.</p>
          </div>
          <button className="btnClose" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }}>
          <GymForm form={form} setForm={setForm} errors={errors} setErrors={setErrors} />
          
          <div className="gym-info-box">
            <span className="material-symbols-outlined gym-info-icon">info</span>
            <p className="gym-info-text">
              Al crear esta sucursal, podrá asignar <strong>Equipamiento</strong> y <strong>Staff</strong> desde el panel de administración centralizado.
            </p>
          </div>

          <div className="gyms-modal-footer">
            <button 
              type="button" 
              className="btn-gym-action btn-gym-cancel" 
              onClick={onClose}
              disabled={saving}
            >
              Cancelar
            </button>
            <button 
              type="submit" 
              className="btn-gym-action btn-gym-submit"
              disabled={saving}
            >
              {saving ? "Guardando..." : submitText}
              <span className="material-symbols-outlined">add_circle</span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}
