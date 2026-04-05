import React from "react";

const EmployeesSection = ({ gym, loadingEmpleados, empleados, handleEditEmpleado, handleDeleteEmpleado }) => {
  if (!gym) return null;

  return (
    <div style={{ marginTop: "48px" }}>
      <h2 style={{
        fontSize: "22px",
        fontWeight: 600,
        marginBottom: "24px",
        color: "var(--text-primary)",
        letterSpacing: "-0.02em"
      }}>
        👥 Empleados de {gym.nombre}
      </h2>
      
      {loadingEmpleados ? (
        <div style={{ color: "var(--text-tertiary)" }}>Cargando empleados...</div>
      ) : empleados.length === 0 ? (
        <div style={{
          background: "var(--bg-secondary)",
          padding: "32px",
          borderRadius: "12px",
          border: "1px solid var(--border-color)",
          textAlign: "center",
          color: "var(--text-tertiary)"
        }}>
          <p>📭 No hay empleados asignados a este gimnasio.</p>
        </div>
      ) : (
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "16px"
        }}>
          {empleados.map((emp) => (
            <div key={emp.id} style={{
              background: "var(--bg-secondary)",
              padding: "20px",
              borderRadius: "12px",
              border: "1px solid var(--border-color)",
              display: "flex",
              flexDirection: "column",
              gap: "12px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                <div>
                  <h4 style={{ margin: "0 0 4px 0", color: "var(--text-primary)" }}>
                    {emp.nombre} {emp.apellido}
                  </h4>
                  <p style={{ margin: "0", fontSize: "0.85rem", color: "var(--text-secondary)" }}>
                    {emp.email}
                  </p>
                </div>
                <span style={{
                  padding: "4px 12px",
                  background: emp.rol === "DUENO" ? "var(--primary-alpha)" : "var(--bg-tertiary)",
                  color: emp.rol === "DUENO" ? "var(--primary-light)" : "var(--text-secondary)",
                  borderRadius: "4px",
                  fontSize: "0.75rem",
                  fontWeight: "bold"
                }}>
                  {emp.rol || "TRABAJADOR"}
                </span>
              </div>
              
              <div style={{ display: "flex", gap: "8px", marginTop: "8px" }}>
                <button
                  onClick={() => handleEditEmpleado(emp)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "var(--primary-alpha)",
                    color: "var(--primary-light)",
                    border: "1px solid var(--primary-light)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--primary)";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "var(--primary-alpha)";
                    e.target.style.color = "var(--primary-light)";
                  }}
                >
                  ✏️ Editar
                </button>
                <button
                  onClick={() => handleDeleteEmpleado(emp)}
                  style={{
                    flex: 1,
                    padding: "8px 12px",
                    background: "rgba(239, 68, 68, 0.1)",
                    color: "var(--danger-color)",
                    border: "1px solid var(--danger-color)",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontSize: "0.85rem",
                    fontWeight: "600",
                    transition: "all 0.3s ease"
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = "var(--danger-color)";
                    e.target.style.color = "white";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = "rgba(239, 68, 68, 0.1)";
                    e.target.style.color = "var(--danger-color)";
                  }}
                >
                  🗑️ Eliminar
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeesSection;
