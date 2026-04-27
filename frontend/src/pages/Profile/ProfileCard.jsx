import React from "react";
import "./Styles/ProfileCard.css";

const ProfileCard = ({ admin, isDueno, setShowCreateGym, rolBadge }) => {
  return (
    <div className="profile-card">
      <div className="profile-avatar">
        <span className="profile-avatar-letters">
          {admin?.nombre?.charAt(0)}{admin?.apellido?.charAt(0)}
        </span>
      </div>
      
      <h2 className="profile-name">{admin?.nombre} {admin?.apellido}</h2>
      <p className="profile-id">ID de Empleado: #{admin?.id}</p>

      <div className="profile-badge">
        {rolBadge}
      </div>

      <div className="profile-details-section">
        <p className="profile-details-label">MÓDULOS ASIGNADOS:</p>
        <ul className="profile-gym-list">
          {admin?.gyms?.map(g => (
            <li key={g.id} className="profile-gym-item">{g.nombre}</li>
          ))}
        </ul>
        {isDueno && (
          <button
            onClick={() => setShowCreateGym(true)}
            className="profile-add-gym-btn"
          >
            + Agregar Nuevo Gimnasio
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
