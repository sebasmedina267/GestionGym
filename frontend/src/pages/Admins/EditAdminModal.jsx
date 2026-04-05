import React from 'react';
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

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
        <div style={{display: "flex", flexDirection: "column", gap: "16px"}}>
          <div style={{textAlign: "center"}}>
            <div style={{width: "100px", height: "100px", borderRadius: "50%", background: "var(--bg-tertiary)", margin: "0 auto 16px", display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden"}}>
              {editForm.photoPreview ? (
                <img src={editForm.photoPreview} alt="Preview" style={{width: "100%", height: "100%", objectFit: "cover"}} />
              ) : (
                <span style={{fontSize: "40px"}}>📷</span>
              )}
            </div>
            <label style={{padding: "8px 16px", background: "var(--primary-alpha)", color: "var(--primary-light)", border: "none", borderRadius: "6px", cursor: "pointer", fontWeight: "600", fontSize: "0.85rem", display: "inline-block", transition: "all 0.3s ease"}}
              onMouseEnter={(e) => {e.target.style.background = "var(--primary)"; e.target.style.color = "white"}}
              onMouseLeave={(e) => {e.target.style.background = "var(--primary-alpha)"; e.target.style.color = "var(--primary-light)"}}
            >
              📸 Cambiar Foto
              <input type="file" accept="image/*" onChange={handleEditPhotoChange} style={{display: "none"}} />
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

          <div>
            <label style={{display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontSize: "0.85rem"}}>Asignar a Sucursal</label>
            <select
              value={editForm.gymId}
              onChange={(e) => setEditForm({ ...editForm, gymId: e.target.value })}
              style={{
                width: "100%", padding: "12px", borderRadius: "8px", 
                background: "var(--bg-tertiary)", color: "var(--text-primary)", 
                border: "1px solid var(--border-color)"
              }}
            >
              <option value="">Selecciona un gimnasio</option>
              {gyms?.map((g) => (
                <option key={g.id} value={g.id}>
                  {g.nombre}
                </option>
              ))}
            </select>
          </div>

          <div style={{display: "flex", gap: "12px"}}>
            <Button variant="secondary" onClick={() => setShowEdit(false)}>Cancelar</Button>
            <Button variant="primary" loading={saving} onClick={handleEditSave} style={{flex: 1}}>
              Guardar Cambios
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
