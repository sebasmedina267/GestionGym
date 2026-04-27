import React from 'react';
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
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
  return (
    <Modal open={showCreateGym} onClose={() => {setShowCreateGym(false); setFormGym({ nombre: "", direccion: "" })}} title="Crear Nueva Sucursal">
      <div className="create-gym-modal-container">
        <div className="create-gym-header">
          <div className="create-gym-icon">🏋️</div>
          <p className="create-gym-desc">Completa los datos para crear una nueva sucursal</p>
        </div>

        <Input
          label="Nombre de la Sucursal"
          value={formGym.nombre}
          onChange={(v) => setFormGym({ ...formGym, nombre: v })}
          error={errors.nombre}
          placeholder="Ej: Gimnasio Centro"
        />

        <Input
          label="Dirección (Opcional)"
          value={formGym.direccion}
          onChange={(v) => setFormGym({ ...formGym, direccion: v })}
          placeholder="Ej: Calle Principal 123"
        />

        <div className="create-gym-actions">
          <Button variant="secondary" onClick={() => {setShowCreateGym(false); setFormGym({ nombre: "", direccion: "" })}}>
            Cancelar
          </Button>
          <Button variant="primary" loading={saving} onClick={handleCreateGym} className="create-gym-btn-confirm">
            Crear Sucursal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
