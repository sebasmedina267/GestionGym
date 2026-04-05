import { useContext, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useGym } from "../../hooks/useGym";
import api from "../../api/axios";

export default function Header() {
  const { admin, logout } = useContext(AuthContext);
  const { gym, setGym } = useGym();
  const navigate = useNavigate();
  const isDueno = admin?.roles?.includes('DUENO');
  const [gyms, setGyms] = useState([]);
  const [showGymSelect, setShowGymSelect] = useState(false);

  const fullName = [admin?.nombre, admin?.apellido].filter(Boolean).join(" ");

  // Cargar gyms disponibles si es dueño
  useEffect(() => {
    if (isDueno) {
      const fetchGyms = async () => {
        try {
          const res = await api.get("/gyms");
          setGyms(res.data.data || []);
        } catch (err) {
          console.error("Error cargando gyms:", err);
        }
      };
      fetchGyms();
    }
  }, [isDueno]);

  const handleSelectGym = (selectedGym) => {
    setGym(selectedGym);
    setShowGymSelect(false);
    window.location.reload(); // Recargar para aplicar cambios
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <h3 style={{
          background: "linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)",
          backgroundClip: "text",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          fontSize: "24px",
          fontWeight: 700,
          marginBottom: "4px",
          letterSpacing: "-0.03em"
        }}>
          💪 FitFlow Management
        </h3>
      </div>

      <div className="navbar-center" style={{ display: "flex", alignItems: "center", gap: "16px" }}>
        {isDueno ? (
          <div style={{ position: "relative" }}>
            <button
              className="gym-selector-btn"
              onClick={() => setShowGymSelect(!showGymSelect)}
              style={{
                padding: "8px 16px",
                borderRadius: "8px",
                border: "1px solid var(--border-color)",
                background: "var(--bg-secondary)",
                color: "var(--text-primary)",
                cursor: "pointer",
                fontWeight: 600,
                transition: "all 0.3s ease",
                display: "flex",
                alignItems: "center",
                gap: "8px",
                fontSize: "13px"
              }}
            >
              🏭 {gym ? gym.nombre : "Seleccionar gimnasio"}
              <span style={{ fontSize: "12px" }}>▼</span>
            </button>
            {showGymSelect && (
              <div
                style={{
                  position: "absolute",
                  top: "100%",
                  left: 0,
                  marginTop: "8px",
                  background: "var(--bg-tertiary)",
                  border: "1px solid var(--border-color)",
                  borderRadius: "8px",
                  minWidth: "200px",
                  maxHeight: "300px",
                  overflowY: "auto",
                  zIndex: 1000,
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                }}
              >
                {gyms.length > 0 ? (
                  gyms.map((g) => (
                    <button
                      key={g.id}
                      onClick={() => handleSelectGym(g)}
                      style={{
                        width: "100%",
                        padding: "12px 16px",
                        textAlign: "left",
                        border: "none",
                        background: gym?.id === g.id ? "var(--primary-alpha)" : "transparent",
                        color: "var(--text-primary)",
                        cursor: "pointer",
                        transition: "all 0.2s ease",
                        display: "flex",
                        alignItems: "center",
                        gap: "8px",
                        fontSize: "13px"
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = "var(--bg-secondary)";
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = gym?.id === g.id ? "var(--primary-alpha)" : "transparent";
                      }}
                    >
                      {gym?.id === g.id ? "✅" : "🏭"} {g.nombre}
                    </button>
                  ))
                ) : (
                  <div style={{ padding: "12px 16px", color: "var(--text-secondary)" }}>
                    Sin gimnasios disponibles
                  </div>
                )}
              </div>
            )}
          </div>
        ) : (
          <span className="gym-name" style={{ fontWeight: 600, fontSize: "13px" }}>
            🏭 {gym ? gym.nombre : "Sin gimnasio seleccionado"}
          </span>
        )}
      </div>

      <div className="navbar-right">
        <div style={{ display: "flex", alignItems: "center", gap: "16px" }}>
          {isDueno && (
            <button
              className="admin-icon-btn"
              onClick={() => navigate("/admins")}
              title="Administración"
              aria-label="Ir a administración"
              style={{
                background: "var(--primary-alpha)",
                border: "1px solid var(--primary-light)",
                borderRadius: "8px",
                padding: "8px 12px",
                cursor: "pointer",
                fontSize: "18px",
                transition: "all 0.3s ease",
              }}
              onMouseEnter={(e) => {
                e.target.style.background = "var(--primary)";
                e.target.style.color = "#fff";
              }}
              onMouseLeave={(e) => {
                e.target.style.background = "var(--primary-alpha)";
                e.target.style.color = "inherit";
              }}
            >
              ⚙️
            </button>
          )}
          <div className="user-details">
            <span className="user-name">{fullName || "Administrador"}</span>
            <span className="user-role">{admin?.rol || ""}</span>
          </div>
        </div>

        <button
          className="logout-btn"
          onClick={logout}
          style={{
            padding: "8px 16px",
            borderRadius: "8px",
            background: "linear-gradient(180deg, #ef4444 0%, #dc2626 100%)",
            color: "white",
            border: "none",
            cursor: "pointer",
            fontWeight: 700,
            transition: "all 0.3s ease",
            fontSize: "13px",
            textTransform: "uppercase",
            letterSpacing: "0.05em",
            boxShadow: "0 4px 12px rgba(239, 68, 68, 0.3)",
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = "translateY(-2px)";
            e.target.style.boxShadow = "0 6px 20px rgba(239, 68, 68, 0.5)";
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = "translateY(0)";
            e.target.style.boxShadow = "0 4px 12px rgba(239, 68, 68, 0.3)";
          }}
        >
          🚪 Cerrar sesión
        </button>
      </div>
    </header>
  );
}
