import React from "react";
import "./Styles/ProfileCard.css";

const ProfileCard = ({ admin, isDueno, setShowCreateGym, rolBadge, onEditProfile }) => {
  const photoUrl = admin?.foto 
    ? (admin.foto.startsWith("http") || admin.foto.startsWith("/uploads") ? admin.foto : `/uploads/${admin.foto}`)
    : null;

  return (
    <div className="profile-card">
      <div className="profile-avatar" style={{ overflow: "hidden", position: "relative" }}>
        {photoUrl ? (
          <img 
            src={photoUrl} 
            alt={`${admin?.nombre} ${admin?.apellido}`} 
            style={{ width: "100%", height: "100%", objectFit: "cover" }} 
          />
        ) : (
          <span className="profile-avatar-letters">
            {admin?.nombre?.charAt(0)}{admin?.apellido?.charAt(0)}
          </span>
        )}
      </div>
      
      <h2 className="profile-name">{admin?.nombre} {admin?.apellido}</h2>
      <p className="profile-email" style={{ color: "var(--ka-on-surface-variant)", fontSize: "0.85rem", marginTop: "-0.5rem", marginBottom: "0.5rem" }}>
        {admin?.email || "Sin correo"}
      </p>
      <p className="profile-id">ID de Cuenta: #{admin?.id}</p>

      <div className="profile-badge">
        {rolBadge}
      </div>

      <button
        onClick={onEditProfile}
        className="profile-edit-btn"
        style={{
          marginTop: "1rem",
          padding: "0.5rem 1rem",
          borderRadius: "8px",
          background: "rgba(56, 189, 248, 0.1)",
          border: "1px solid rgba(56, 189, 248, 0.3)",
          color: "var(--ka-primary)",
          fontWeight: 600,
          cursor: "pointer",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: "0.5rem",
          width: "100%"
        }}
      >
        <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>edit</span>
        Editar Mi Perfil
      </button>

      <div className="profile-details-section">
        <p className="profile-details-label">SUCURSALES ASIGNADAS:</p>
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
