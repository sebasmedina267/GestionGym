import React from "react";
import "./Styles/EmployeesSection.css";

const EmployeesSection = ({ gym, loadingEmpleados, empleados, handleEditEmpleado, handleDeleteEmpleado, isDueno, isEncargado }) => {
  if (!gym) return null;

  return (
    <div className="employees-section-container">
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
        <div>
          <h2 className="employees-section-title">
            👥 {isEncargado && !isDueno ? "Personal a tu cargo" : "Empleados de la Sucursal"} — {gym.nombre}
          </h2>
          <p style={{ color: "var(--ka-on-surface-variant)", fontSize: "0.85rem", margin: 0 }}>
            {isDueno ? "Supervisión y control administrativo del equipo" : "Vista del personal y equipo de trabajo asignado a esta sucursal"}
          </p>
        </div>
        {isEncargado && !isDueno && (
          <span style={{ 
            background: "rgba(16, 185, 129, 0.15)", 
            color: "#10b981", 
            border: "1px solid rgba(16, 185, 129, 0.3)", 
            padding: "0.35rem 0.75rem", 
            borderRadius: "20px", 
            fontSize: "0.75rem", 
            fontWeight: 700 
          }}>
            Vista de Encargado
          </span>
        )}
      </div>
      
      {loadingEmpleados ? (
        <div className="employees-loading">Cargando empleados...</div>
      ) : empleados.length === 0 ? (
        <div className="employees-empty-state">
          <p>📭 No hay empleados asignados a este gimnasio.</p>
        </div>
      ) : (
        <div className="employees-grid">
          {empleados.map((emp) => {
            const photoUrl = emp.foto ? (emp.foto.startsWith("http") || emp.foto.startsWith("/uploads") ? emp.foto : `/uploads/${emp.foto}`) : null;
            return (
              <div key={emp.id} className="employee-card">
                <div className="employee-card-header" style={{ display: "flex", alignItems: "center", gap: "0.75rem" }}>
                  <div style={{
                    width: "44px",
                    height: "44px",
                    borderRadius: "50%",
                    background: "var(--ka-surface-container-high)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    color: "var(--ka-primary)",
                    overflow: "hidden",
                    flexShrink: 0
                  }}>
                    {photoUrl ? (
                      <img src={photoUrl} alt={emp.nombre} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    ) : (
                      <span>{emp.nombre?.charAt(0)}{emp.apellido?.charAt(0)}</span>
                    )}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h4 className="employee-card-name">
                      {emp.nombre} {emp.apellido}
                    </h4>
                    <p className="employee-card-email">
                      {emp.email || "Sin correo"}
                    </p>
                  </div>
                  <span className={`employee-role-badge ${emp.rol === "DUENO" ? "role-dueno" : emp.rol === "ENCARGADO" ? "role-encargado" : "role-empleado"}`}>
                    {emp.rol || "EMPLEADO"}
                  </span>
                </div>
                
                {isDueno && (
                  <div className="employee-actions">
                    <button
                      onClick={() => handleEditEmpleado(emp)}
                      className="employee-btn btn-edit-employee"
                    >
                      ✏️ Editar
                    </button>
                    <button
                      onClick={() => handleDeleteEmpleado(emp)}
                      className="employee-btn btn-delete-employee"
                    >
                      🗑️ Eliminar
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EmployeesSection;
