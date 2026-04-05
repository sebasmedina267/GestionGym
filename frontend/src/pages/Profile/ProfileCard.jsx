import React from "react";

const ProfileCard = ({ admin, isDueno, setShowCreateGym, rolBadge }) => {
  return (
    <div style={{background: "var(--bg-secondary)", padding: "32px", borderRadius: "12px", border: "var(--glass-border)", height: "fit-content", textAlign: "center"}}>
      <div style={{width: "100px", height: "100px", borderRadius: "50%", background: "var(--primary-alpha)", margin: "0 auto 16px auto", display: "flex", alignItems: "center", justifyContent: "center"}}>
        <span style={{fontSize: "2.5rem", color: "var(--primary)"}}>
          {admin?.nombre?.charAt(0)}{admin?.apellido?.charAt(0)}
        </span>
      </div>
      
      <h2 style={{margin: "0 0 8px 0", color: "var(--text-primary)"}}>{admin?.nombre} {admin?.apellido}</h2>
      <p style={{margin: "0 0 24px 0", color: "var(--text-secondary)"}}>ID de Empleado: #{admin?.id}</p>

      <div style={{display: "inline-block", padding: "8px 16px", background: "var(--bg-tertiary)", borderRadius: "20px", color: "var(--primary-light)", fontWeight: "bold", fontSize: "0.9rem", border: "1px solid var(--border-color)"}}>
        {rolBadge}
      </div>

      <div style={{marginTop: "32px", textAlign: "left", paddingTop: "24px", borderTop: "1px solid var(--border-color)"}}>
        <p style={{fontSize: "0.85rem", color: "var(--text-secondary)", marginBottom: "8px"}}>MÓDULOS ASIGNADOS:</p>
        <ul style={{listStyleType: "none", padding: 0, margin: 0, display: "flex", flexWrap: "wrap", gap: "8px"}}>
          {admin?.gyms?.map(g => (
            <li key={g.id} style={{background: "var(--bg-tertiary)", padding: "4px 12px", borderRadius: "4px", fontSize: "0.85rem"}}>{g.nombre}</li>
          ))}
        </ul>
        {isDueno && (
          <button
            onClick={() => setShowCreateGym(true)}
            style={{
              marginTop: "16px",
              padding: "10px 16px",
              background: "linear-gradient(180deg, #10b981 0%, #047857 100%)",
              color: "white",
              border: "none",
              borderRadius: "8px",
              cursor: "pointer",
              fontWeight: "bold",
              fontSize: "0.9rem",
              transition: "all 0.3s ease",
            }}
            onMouseEnter={(e) => {
              e.target.style.transform = "translateY(-2px)";
              e.target.style.boxShadow = "0 6px 20px rgba(16, 185, 129, 0.4)";
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            + Agregar Nuevo Gimnasio
          </button>
        )}
      </div>
    </div>
  );
};

export default ProfileCard;
