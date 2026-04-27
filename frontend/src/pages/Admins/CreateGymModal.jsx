import React from 'react';
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import './Styles/CreateGymModal.css';

export default function CreateGymModal({
  showCreateGym,
  setShowCreateGym,
  formGym,
  setFormGym,
  errors,
  handleCreateGym,
  saving
}) {

  const closeAndReset = () => {
    setShowCreateGym(false);
    setFormGym({ nombre: "", direccion: "" });
  };

  return (
    <Modal
      open={showCreateGym}
      onClose={closeAndReset}
      clean
    >
      <div className="create-gym-modal-container">
        {/* Header with Background */}
        <div className="create-gym-header-bg">
          <button className="create-gym-close-top" onClick={closeAndReset}>
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="create-gym-icon-wrapper">
            <div className="create-gym-icon-circle">
              <span className="create-gym-icon">🏢</span>
            </div>
          </div>
        </div>

        <div className="create-gym-form">
          <div className="create-gym-title-area">
            <h3 className="create-gym-title">Nueva Sucursal</h3>
            <p className="create-gym-subtitle">Gestión de Ubicaciones</p>
          </div>

          <form className="create-gym-grid" onSubmit={(e) => { e.preventDefault(); handleCreateGym(); }}>
            <Input
              label="Nombre de la Sucursal"
              value={formGym.nombre}
              onChange={(v) => setFormGym({ ...formGym, nombre: v })}
              error={errors.nombre}
              variant="kinetic"
              placeholder="Ej: Gimnasio Centro"
            />

            <div className="create-gym-full-width">
              <Input
                label="Dirección (Opcional)"
                value={formGym.direccion}
                onChange={(v) => setFormGym({ ...formGym, direccion: v })}
                error={errors.direccion}
                variant="kinetic"
                placeholder="Ej: Calle Principal 123"
                icon="location_on"
              />
            </div>

            <div className="create-gym-full-width create-gym-form-actions">
              <button 
                type="button" 
                className="btn-gym-cancel" 
                onClick={closeAndReset}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-gym-submit"
                disabled={saving}
              >
                {saving ? "Creando..." : "Crear Sucursal"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
