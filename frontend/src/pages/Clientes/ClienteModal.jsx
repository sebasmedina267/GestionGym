import { useState } from "react";
import Input from "../../components/ui/Input";
import Modal from "../../components/ui/Modal";
import "./Styles/ClienteModal.css";

/**
 * ClienteModal Component
 * 
 * Provides a specialized form for creating or editing client records.
 * Features a high-fidelity 'Kinetic' UI design with demographic selection 
 * and simulated biometric features.
 * 
 * Props:
 * @param {boolean} open - Controls modal visibility
 * @param {Function} onClose - Callback to dismiss the modal
 * @param {Function} onSave - Callback to persist the form data
 * @param {Object} editing - Optional client record to pre-populate the form
 */
export default function ClienteModal({ open, onClose, onSave, editing }) {

  // Computes initial state based on whether we are creating or updating
  const getInitialForm = () => ({
    nombre: editing?.nombre || "",
    apellido: editing?.apellido || "",
    email: editing?.email || "",
    telefono: editing?.telefono || "",
    edad: editing?.edad || "",
    sexo: editing?.sexo || "",
  });

  const [form, setForm] = useState(getInitialForm);

  /** Curried state update function for individual fields */
  const update = (field) => (value) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  /** Handles the final form submission */
  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(form);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      clean // Instructs Modal to use raw container without default styling
    >
      <div className="modal-container">

        {/* Modal Header: Displays action title and closes buttons */}
        <div className="cliente-modal-header">
          <div className="cliente-modal-title-area">
            <h2>{editing ? "Editar Perfil de Cliente" : "Inscripción de Nuevo Cliente"}</h2>
            <p className="cliente-modal-subtitle">Gestión de Membresías y Afiliados</p>
          </div>
          <button className="cliente-close-btn" onClick={onClose}>
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        {/* Primary Enrollment Form */}
        <form className="cliente-form-body" onSubmit={handleSubmit}>

          {/* Identity Section */}
          <div className="cliente-form-row">
            <Input
              label="Nombre"
              value={form.nombre}
              onChange={update("nombre")}
              variant="kinetic"
              placeholder="Ej. Ricardo"
              required
            />
            <Input
              label="Apellido"
              value={form.apellido}
              onChange={update("apellido")}
              variant="kinetic"
              placeholder="Ej. Miller"
              required
            />
          </div>

          {/* Contact Details (Email & Phone) */}
          <div className="cliente-form-row" style={{ marginTop: "0.75rem" }}>
            <Input
              label="Correo Electrónico"
              type="email"
              value={form.email}
              onChange={update("email")}
              variant="kinetic"
              placeholder="cliente@ejemplo.com"
              icon="mail"
            />
            <Input
              label="Teléfono (Opcional)"
              type="tel"
              value={form.telefono}
              onChange={update("telefono")}
              variant="kinetic"
              placeholder="Ej. 612 345 678"
              icon="call"
            />
          </div>

          {/* Demographics Section */}
          <div className="cliente-bio-grid" style={{ marginTop: "0.75rem" }}>
            <Input
              label="Edad"
              type="number"
              value={form.edad}
              onChange={update("edad")}
              variant="kinetic"
              placeholder="28"
              required
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
                  <option value="" disabled>Seleccionar Género</option>
                  <option value="M">Masculino</option>
                  <option value="F">Femenino</option>
                  <option value="O">Otro</option>
                </select>
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: '1rem', pointerEvents: 'none', color: 'var(--ka-on-surface-variant)' }}>expand_more</span>
              </div>
            </div>
          </div>

          {/* Information Tip: Automatic App Credential generation */}
          {!editing && form.email && (
            <div style={{
              marginTop: "1rem",
              padding: "0.75rem 1rem",
              borderRadius: "10px",
              background: "rgba(56, 189, 248, 0.08)",
              border: "1px solid rgba(56, 189, 248, 0.2)",
              display: "flex",
              alignItems: "center",
              gap: "0.75rem"
            }}>
              <span className="material-symbols-outlined" style={{ color: "var(--ka-primary)", fontSize: "20px" }}>
                key
              </span>
              <p style={{ margin: 0, fontSize: "0.78rem", color: "var(--ka-on-surface-variant)", lineHeight: 1.4 }}>
                Se generará automáticamente una <strong>contraseña temporal</strong> de acceso para este usuario y se enviará a su correo. Podrás visualizarla en pantalla para proporcionársela al cliente en el momento.
              </p>
            </div>
          )}

          {/* Footer Actions */}
          <div className="cliente-modal-actions">
            <button className="cliente-btn-cancel" type="button" onClick={onClose}>
              Cancelar
            </button>
            <button className="cliente-btn-submit" type="submit">
              {editing ? "Guardar Cambios" : "Confirmar Inscripción"}
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}