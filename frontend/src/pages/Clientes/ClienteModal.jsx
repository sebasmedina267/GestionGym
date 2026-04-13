import { useState } from "react";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import "./Styles/ClienteModal.css";

export default function ClienteModal({ open, onClose, onSave, editing }) {
  const getInitialForm = () => ({
    nombre: editing?.nombre || "",
    apellido: editing?.apellido || "",
    edad: editing?.edad || "",
    sexo: editing?.sexo || "",
  });

  const [form, setForm] = useState(getInitialForm);

  const update = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      clean
    >
      <div className="modal-container">
        <div className="cliente-modal-header">
           <div className="cliente-modal-title-area">
              <h2>{editing ? "Editar Cliente" : "Nuevo Cliente"}</h2>
              <p className="cliente-modal-subtitle">Registro de Membresía Elite</p>
           </div>
           <button className="cliente-close-btn" onClick={onClose}>
              <span className="material-symbols-outlined">close</span>
           </button>
        </div>

        <form className="cliente-form-body" onSubmit={handleSubmit}>
          <div className="cliente-form-row">
            <Input 
              label="Nombre" 
              value={form.nombre} 
              onChange={update("nombre")} 
              variant="kinetic"
              placeholder="Ej. Ricardo"
            />
            <Input 
              label="Apellido" 
              value={form.apellido} 
              onChange={update("apellido")} 
              variant="kinetic"
              placeholder="Ej. Mendoza"
            />
          </div>

          <div className="cliente-bio-grid">
            <Input 
              label="Edad" 
              type="number" 
              value={form.edad} 
              onChange={update("edad")} 
              variant="kinetic"
              placeholder="28"
            />
            
            <div className="ka-form-group">
              <label className="ka-label">Sexo</label>
              <div className="ka-input-wrapper">
                <select 
                  className="ka-select" 
                  name="sexo" 
                  value={form.sexo} 
                  onChange={(e) => update("sexo")(e.target.value)} 
                  required
                >
                  <option value="" disabled>Seleccionar género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: '1rem', pointerEvents: 'none', color: 'var(--ka-on-surface-variant)' }}>expand_more</span>
              </div>
            </div>
          </div>

          {/* Aesthetic Feature Card */}
          <div className="cliente-feature-card">
            <div className="feature-icon-wrapper">
              <span className="material-symbols-outlined feature-icon" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
            </div>
            <div className="feature-content">
              <p>Captura Biométrica</p>
              <p>Sincroniza la foto del perfil con el sistema Onyx Pass.</p>
            </div>
            <button className="feature-btn" type="button">Iniciar</button>
          </div>

          <div className="cliente-modal-actions">
            <button className="cliente-btn-cancel" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="cliente-btn-submit" type="submit">
              {editing ? "Guardar Cambios" : "Registrar Cliente"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}