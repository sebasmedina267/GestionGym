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
  employeeToDelete
}) => {
  return (
    <>
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
                Descripción
              </label>
              <textarea
                placeholder="Descripción del gimnasio..."
                value={newGymForm.descripcion}
                onChange={(e) => setNewGymForm({...newGymForm, descripcion: e.target.value})}
                rows="3"
                className="profile-textarea"
              />
            </div>

            <div className="profile-form-group">
              <label className="profile-form-label">
                Ciudad
              </label>
              <input
                type="text"
                placeholder="Ej: Madrid"
                value={newGymForm.ciudad}
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
                <option value="TRABAJADOR">👤 Trabajador</option>
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
