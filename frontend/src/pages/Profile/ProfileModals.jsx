import React from "react";

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
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
        }}>
          <div style={{
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "400px",
            width: "90%",
            border: "1px solid var(--border-color)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{margin: "0 0 24px 0", color: "var(--text-primary)"}}>Crear Nuevo Gimnasio</h2>
            
            <div style={{marginBottom: "16px"}}>
              <label style={{display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem"}}>
                Nombre del Gimnasio *
              </label>
              <input
                type="text"
                placeholder="Ej: FitFlow Plus Centro"
                value={newGymForm.nombre}
                onChange={(e) => setNewGymForm({...newGymForm, nombre: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{marginBottom: "16px"}}>
              <label style={{display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem"}}>
                Descripción
              </label>
              <textarea
                placeholder="Descripción del gimnasio..."
                value={newGymForm.descripcion}
                onChange={(e) => setNewGymForm({...newGymForm, descripcion: e.target.value})}
                rows="3"
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  resize: "vertical",
                }}
              />
            </div>

            <div style={{marginBottom: "24px"}}>
              <label style={{display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem"}}>
                Ciudad
              </label>
              <input
                type="text"
                placeholder="Ej: Madrid"
                value={newGymForm.ciudad}
                onChange={(e) => setNewGymForm({...newGymForm, ciudad: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{display: "flex", gap: "12px"}}>
              <button
                onClick={() => setShowCreateGym(false)}
                disabled={savingGym}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  cursor: savingGym ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: savingGym ? 0.6 : 1,
                  transition: "all 0.3s ease",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleCreateGym}
                disabled={savingGym}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  background: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
                  color: "white",
                  border: "none",
                  cursor: savingGym ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: savingGym ? 0.6 : 1,
                  transition: "all 0.3s ease",
                }}
              >
                {savingGym ? "Creando..." : "Crear Gimnasio"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL EDITAR EMPLEADO */}
      {showEditEmpleado && selectedEmpleado && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
        }}>
          <div style={{
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "400px",
            width: "90%",
            border: "1px solid var(--border-color)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{margin: "0 0 24px 0", color: "var(--text-primary)"}}>Editar Empleado</h2>
            
            <div style={{marginBottom: "16px"}}>
              <label style={{display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem"}}>
                Nombre *
              </label>
              <input
                type="text"
                value={editForm.nombre}
                onChange={(e) => setEditForm({...editForm, nombre: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{marginBottom: "16px"}}>
              <label style={{display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem"}}>
                Apellido *
              </label>
              <input
                type="text"
                value={editForm.apellido}
                onChange={(e) => setEditForm({...editForm, apellido: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{marginBottom: "16px"}}>
              <label style={{display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem"}}>
                Email
              </label>
              <input
                type="email"
                value={editForm.email}
                onChange={(e) => setEditForm({...editForm, email: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                }}
              />
            </div>

            <div style={{marginBottom: "24px"}}>
              <label style={{display: "block", marginBottom: "8px", color: "var(--text-secondary)", fontWeight: "600", fontSize: "0.9rem"}}>
                Rol
              </label>
              <select
                value={editForm.rol}
                onChange={(e) => setEditForm({...editForm, rol: e.target.value})}
                style={{
                  width: "100%",
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  fontFamily: "inherit",
                  boxSizing: "border-box",
                  cursor: "pointer"
                }}
              >
                <option value="TRABAJADOR">👤 Trabajador</option>
                <option value="DUENO">👑 Dueño</option>
              </select>
            </div>

            <div style={{display: "flex", gap: "12px"}}>
              <button
                onClick={() => setShowEditEmpleado(false)}
                disabled={savingEmpleado}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  cursor: savingEmpleado ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: savingEmpleado ? 0.6 : 1,
                  transition: "all 0.3s ease",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveEmpleado}
                disabled={savingEmpleado}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  background: "linear-gradient(180deg, #3b82f6 0%, #1d4ed8 100%)",
                  color: "white",
                  border: "none",
                  cursor: savingEmpleado ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: savingEmpleado ? 0.6 : 1,
                  transition: "all 0.3s ease",
                }}
              >
                {savingEmpleado ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL CONFIRMAR ELIMINACIÓN */}
      {showConfirmDelete && employeeToDelete && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 99999,
        }}>
          <div style={{
            background: "var(--bg-secondary)",
            borderRadius: "12px",
            padding: "32px",
            maxWidth: "400px",
            width: "90%",
            border: "1px solid var(--border-color)",
            boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
          }}>
            <h2 style={{margin: "0 0 16px 0", color: "var(--text-primary)"}}>⚠️ Confirmar Eliminación</h2>
            <p style={{margin: "0 0 24px 0", color: "var(--text-secondary)"}}>
              ¿Estás seguro de que quieres eliminar a <strong>{employeeToDelete.nombre} {employeeToDelete.apellido}</strong>?
            </p>
            <p style={{margin: "0 0 24px 0", color: "var(--danger-color)", fontSize: "0.9rem"}}>
              ⚠️ Esta acción no se puede deshacer.
            </p>
            
            <div style={{display: "flex", gap: "12px"}}>
              <button
                onClick={() => setShowConfirmDelete(false)}
                disabled={savingEmpleado}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  border: "1px solid var(--border-color)",
                  background: "var(--bg-tertiary)",
                  color: "var(--text-primary)",
                  cursor: savingEmpleado ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: savingEmpleado ? 0.6 : 1,
                  transition: "all 0.3s ease",
                }}
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={savingEmpleado}
                style={{
                  flex: 1,
                  padding: "12px",
                  borderRadius: "8px",
                  background: "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)",
                  color: "white",
                  border: "none",
                  cursor: savingEmpleado ? "not-allowed" : "pointer",
                  fontWeight: "600",
                  opacity: savingEmpleado ? 0.6 : 1,
                  transition: "all 0.3s ease",
                }}
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
