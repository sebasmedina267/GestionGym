import React from 'react';
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";
import './Styles/EditAdminModal.css';

export default function EditAdminModal({
  showEdit,
  setShowEdit,
  selectedAdmin,
  editForm,
  setEditForm,
  errors,
  gyms,
  handleEditPhotoChange,
  handleEditSave,
  saving
}) {
  return (
    <Modal open={showEdit} onClose={() => setShowEdit(false)} title="Editar Empleado">
      {selectedAdmin && (
        <div className="edit-admin-modal-container">
          <div className="edit-admin-photo-container">
            <div className="edit-admin-photo-preview">
              {editForm.photoPreview ? (
                <img src={editForm.photoPreview} alt="Preview" className="edit-admin-photo-img" />
              ) : (
                <span className="edit-admin-photo-icon">📷</span>
              )}
            </div>
            <label className="edit-admin-photo-btn">
              📸 Cambiar Foto
              <input type="file" accept="image/*" onChange={handleEditPhotoChange} className="edit-admin-photo-input" />
            </label>
          </div>

          <Input
            label="Nombre"
            value={editForm.nombre}
            onChange={(v) => setEditForm({ ...editForm, nombre: v })}
            error={errors.nombre}
          />

          <Input
            label="Apellido"
            value={editForm.apellido}
            onChange={(v) => setEditForm({ ...editForm, apellido: v })}
            error={errors.apellido}
          />

          <Input
            label="Correo Electrónico"
            type="email"
            value={editForm.email}
            onChange={(v) => setEditForm({ ...editForm, email: v })}
            error={errors.email}
          />

          <div>
            <label className="edit-admin-select-label">Asignar a Sucursal</label>
            <select
              value={editForm.gymId}
              onChange={(e) => setEditForm({ ...editForm, gymId: e.target.value })}
              className="edit-admin-select"
            >
              <option value="">Selecciona un gimnasio</option>
              {gyms?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>

          <div className="edit-admin-actions">
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancelar</Button>
            <Button variant="primary" loading={saving} onClick={handleEditSave} className="edit-admin-btn-save">
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
