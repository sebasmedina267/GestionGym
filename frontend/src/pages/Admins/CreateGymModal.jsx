import React from 'react';
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

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
      <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
        <div style={{
          background: "linear-gradient(135deg, var(--primary-alpha) 0%, rgba(99, 102, 241, 0.05) 100%)",
          padding: "20px",
          borderRadius: "12px",
          border: "1px solid var(--primary-alpha)",
          textAlign: "center"
        }}>
          <div style={{fontSize: "40px", marginBottom: "8px"}}>🏋️</div>
          <p style={{color: "var(--text-secondary)", margin: "0", fontSize: "0.9rem"}}>Completa los datos para crear una nueva sucursal</p>
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

        <div style={{display: "flex", gap: "12px"}}>
          <Button variant="secondary" onClick={() => {setShowCreateGym(false); setFormGym({ nombre: "", direccion: "" })}}>
            Cancelar
          </Button>
          <Button variant="primary" loading={saving} onClick={handleCreateGym} style={{flex: 1}}>
            Crear Sucursal
          </Button>
        </div>
      </div>
    </Modal>
  );
}
