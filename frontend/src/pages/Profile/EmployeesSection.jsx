import React from "react";
import "./Styles/EmployeesSection.css";

const EmployeesSection = ({ gym, loadingEmpleados, empleados, handleEditEmpleado, handleDeleteEmpleado }) => {
  if (!gym) return null;

  return (
    <div className="employees-section-container">
      <h2 className="employees-section-title">
        👥 Empleados de {gym.nombre}
      </h2>
      
      {loadingEmpleados ? (
        <div className="employees-loading">Cargando empleados...</div>
      ) : empleados.length === 0 ? (
        <div className="employees-empty-state">
          <p>📭 No hay empleados asignados a este gimnasio.</p>
        </div>
      ) : (
        <div className="employees-grid">
          {empleados.map((emp) => (
            <div key={emp.id} className="employee-card">
              <div className="employee-card-header">
                <div>
                  <h4 className="employee-card-name">
                    {emp.nombre} {emp.apellido}
                  </h4>
                  <p className="employee-card-email">
                    {emp.email}
                  </p>
                </div>
                <span className={`employee-role-badge ${emp.rol === "DUENO" ? "role-dueno" : "role-empleado"}`}>
                  {emp.rol || "EMPLEADO"}
                </span>
              </div>
              
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
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default EmployeesSection;
