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
              <h2>{editing ? "Editar Perfil" : "Inscripción de Nuevo Cliente"}</h2>
              <p className="cliente-modal-subtitle">Registro de Membresía Elite</p>
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
            />
            <Input 
              label="Apellido" 
              value={form.apellido} 
              onChange={update("apellido")} 
              variant="kinetic"
              placeholder="Ej. Miller"
            />
          </div>

          {/* Demographics Section */}
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
              <label className="ka-label">Sexo Biológico</label>
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

          {/* Aesthetic Feature Card: High-tech mockup for premium feel */}
          <div className="cliente-feature-card">
            <div className="feature-icon-wrapper">
              <span className="material-symbols-outlined feature-icon" style={{ fontVariationSettings: "'FILL' 1" }}>add_a_photo</span>
            </div>
            <div className="feature-content">
              <p>Captura Biométrica</p>
              <p>Sincroniza la imagen de perfil con el sistema de identificación Onyx Pass.</p>
            </div>
            <button className="feature-btn" type="button">Inicializar</button>
          </div>

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