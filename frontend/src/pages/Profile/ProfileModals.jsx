import React from "react";
import "./Styles/ProfileModals.css";

const ProfileModals = ({
  showCreateGym,
  setShowCreateGym,
  newGymForm,
  setNewGymForm,
  savingGym,
  handleCreateGym,
  showEditEmpleado,
  setShowEditEmpleado,
  selectedEmpleado,
  editForm,
  setEditForm,
  savingEmpleado,
  handleSaveEmpleado,
  showConfirmDelete,
  setShowConfirmDelete,
  confirmDelete,
  employeeToDelete,
  showEditMyProfile,
  setShowEditMyProfile,
  myProfileForm,
  setMyProfileForm,
  savingMyProfile,
  handleMyPhotoChange,
  handleSaveMyProfile
}) => {
  return (
    <>
      {/* MODAL EDITAR MI PERFIL (Para todos los roles) */}
      {showEditMyProfile && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <h2 className="profile-modal-title">Editar Mi Perfil</h2>
            
            <div style={{ display: "flex", flexDirection: "column", alignItems: "center", marginBottom: "1.25rem" }}>
              <div 
                style={{
                  width: "90px",
                  height: "90px",
                  borderRadius: "50%",
                  background: "var(--ka-surface-container-high)",
                  border: "2px dashed var(--ka-primary)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  overflow: "hidden",
                  cursor: "pointer",
                  position: "relative"
                }}
                onClick={() => document.getElementById("my-photo-file-input")?.click()}
              >
                {myProfileForm?.photoPreview ? (
                  <img src={myProfileForm.photoPreview} alt="Preview" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  <span className="material-symbols-outlined" style={{ fontSize: "36px", color: "var(--ka-primary)" }}>
                    photo_camera
                  </span>
                )}
              </div>
              <input
                id="my-photo-file-input"
                type="file"
                accept="image/*"
                onChange={handleMyPhotoChange}
                style={{ display: "none" }}
              />
              <button
                type="button"
                onClick={() => document.getElementById("my-photo-file-input")?.click()}
                style={{
                  marginTop: "0.5rem",
                  background: "transparent",
                  border: "none",
                  color: "var(--ka-primary)",
                  fontSize: "0.8rem",
                  fontWeight: 600,
                  cursor: "pointer"
                }}
              >
                📸 Cambiar Fotografía
              </button>
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Nombre *</label>
              <input
                type="text"
                value={myProfileForm?.nombre || ""}
                onChange={(e) => setMyProfileForm({ ...myProfileForm, nombre: e.target.value })}
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Apellido *</label>
              <input
                type="text"
                value={myProfileForm?.apellido || ""}
                onChange={(e) => setMyProfileForm({ ...myProfileForm, apellido: e.target.value })}
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">Correo Electrónico</label>
              <input
                type="email"
                value={myProfileForm?.email || ""}
                onChange={(e) => setMyProfileForm({ ...myProfileForm, email: e.target.value })}
                className="profile-input"
              />
            </div>

            <div className="profile-modal-actions">
              <button
                type="button"
                onClick={() => setShowEditMyProfile(false)}
                disabled={savingMyProfile}
                className="profile-btn-modal btn-cancel-modal"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveMyProfile}
                disabled={savingMyProfile}
                className="profile-btn-modal btn-confirm-edit"
              >
                {savingMyProfile ? "Guardando..." : "Guardar Perfil"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CREAR GIMNASIO */}
      {showCreateGym && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <h2 className="profile-modal-title">Crear Nuevo Gimnasio</h2>
            
            <div className="profile-form-group">
              <label className="profile-form-label">
                Nombre del Gimnasio *
              </label>
              <input
                type="text"
                placeholder="Ej: FitFlow Plus Centro"
                value={newGymForm.nombre}
                onChange={(e) => setNewGymForm({...newGymForm, nombre: e.target.value})}
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                Dirección
              </label>
              <input
                type="text"
                placeholder="Ej: Av. de la Constitución 45"
                value={newGymForm.direccion || ""}
                onChange={(e) => setNewGymForm({...newGymForm, direccion: e.target.value})}
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                Sitio Web (Opcional)
              </label>
              <input
                type="text"
                placeholder="Ej: https://patasgym.com"
                value={newGymForm.urlWeb || ""}
                onChange={(e) => setNewGymForm({...newGymForm, urlWeb: e.target.value})}
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                Ciudad
              </label>
              <input
                type="text"
                placeholder="Ej: Madrid"
                value={newGymForm.ciudad || ""}
                onChange={(e) => setNewGymForm({...newGymForm, ciudad: e.target.value})}
                className="profile-input"
              />
            </div>

            <div className="profile-modal-actions">
              <button
                onClick={() => setShowCreateGym(false)}
                disabled={savingGym}
                className="profile-btn-modal btn-cancel-modal"
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGym}
                disabled={savingGym}
                className="profile-btn-modal btn-confirm-gym"
              >
                {savingGym ? "Creando..." : "Crear Gimnasio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EMPLEADO */}
      {showEditEmpleado && selectedEmpleado && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <h2 className="profile-modal-title">Editar Empleado</h2>
            
            <div className="profile-form-group">
              <label className="profile-form-label">
                Nombre *
              </label>
              <input
                type="text"
                value={editForm.nombre}
                onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                Apellido *
              </label>
              <input
                type="text"
                value={editForm.apellido}
                onChange={(e) => setEditForm({...editForm, apellido: e.target.value})}
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                className="profile-input"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                Rol
              </label>
              <select
                value={editForm.rol}
                onChange={(e) => setEditForm({...editForm, rol: e.target.value})}
                className="profile-select"
              >
                <option value="EMPLEADO">👤 Empleado (Estándar)</option>
                <option value="ENCARGADO">⭐ Encargado (Manager)</option>
                <option value="DUENO">👑 Dueño</option>
              </select>
            </div>

            <div className="profile-modal-actions">
              <button
                onClick={() => setShowEditEmpleado(false)}
                disabled={savingEmpleado}
                className="profile-btn-modal btn-cancel-modal"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEmpleado}
                disabled={savingEmpleado}
                className="profile-btn-modal btn-confirm-edit"
              >
                {savingEmpleado ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {showConfirmDelete && employeeToDelete && (
        <div className="profile-modal-overlay">
          <div className="profile-modal-content">
            <h2 className="profile-modal-title">⚠️ Confirmar Eliminación</h2>
            <p className="profile-id">
              ¿Estás seguro de que quieres eliminar a <strong>{employeeToDelete.nombre} {employeeToDelete.apellido}</strong>?
            </p>
            <p className="delete-warning-text">
              ⚠️ Esta acción no se puede deshacer.
            </p>
            
            <div className="profile-modal-actions">
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={savingEmpleado}
                className="profile-btn-modal btn-cancel-modal"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={savingEmpleado}
                className="profile-btn-modal btn-confirm-delete"
              >
                {savingEmpleado ? "Eliminando..." : "Sí, Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default ProfileModals;

