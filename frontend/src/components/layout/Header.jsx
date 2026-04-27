import { useContext, useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useGym } from "../../hooks/useGym";
import api from "../../api/axios";
import "./Header.css";

export default function Header() {
  const { admin, logout } = useContext(AuthContext);
  const { gym, setGym } = useGym();
  const navigate = useNavigate();
  const isDueno = admin?.roles?.includes("DUENO");
  const [gyms, setGyms] = useState([]);
  const [showGymSelect, setShowGymSelect] = useState(false);
  const dropdownRef = useRef(null);

  const fullName = [admin?.nombre, admin?.apellido].filter(Boolean).join(" ");
  const initials = [admin?.nombre?.[0], admin?.apellido?.[0]].filter(Boolean).join("").toUpperCase() || "A";

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

  // Cerrar dropdown al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowGymSelect(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelectGym = (selectedGym) => {
    setGym(selectedGym);
    setShowGymSelect(false);
    window.location.reload();
  };

  return (
    <>
      <header className="header">
        {/* Center: Gym Selector */}
        <div className="header-center">
          {isDueno ? (
            <div className="gym-selector-wrapper" ref={dropdownRef}>
              <button
                className="gym-selector-pill"
                onClick={() => setShowGymSelect(!showGymSelect)}
                aria-haspopup="listbox"
                aria-expanded={showGymSelect}
              >
                <span
                  className="material-symbols-outlined"
                  style={{ color: "#bdc2ff", fontSize: "20px" }}
                >
                  factory
                </span>
                {gym ? gym.nombre : "Seleccionar gimnasio"}
                <span className="material-symbols-outlined gym-chevron">
                  expand_more
                </span>
              </button>

              {showGymSelect && (
                <div className="gym-dropdown-menu">
                  {gyms.length > 0 ? (
                    gyms.map((g) => (
                      <button
                        key={g.id}
                        className={`gym-dropdown-item${gym?.id === g.id ? " selected" : ""}`}
                        onClick={() => handleSelectGym(g)}
                        role="option"
                        aria-selected={gym?.id === g.id}
                      >
                        <span
                          className="material-symbols-outlined"
                          style={{ fontSize: "18px", color: gym?.id === g.id ? "#4edea3" : "#454653" }}
                        >
                          {gym?.id === g.id ? "check_circle" : "factory"}
                        </span>
                        {g.nombre}
                      </button>
                    ))
                  ) : (
                    <div className="gym-dropdown-empty">
                      Sin gimnasios disponibles
                    </div>
                  )}
                </div>
              )}
            </div>
          ) : (
            <div className="gym-selector-pill gym-selector-pill-disabled">
              <span
                className="material-symbols-outlined"
                style={{ color: "#bdc2ff", fontSize: "20px" }}
              >
                factory
              </span>
              {gym ? gym.nombre : "Sin gimnasio seleccionado"}
            </div>
          )}
        </div>

        {/* Right: Actions + Profile + Logout */}
        <div className="header-right">
          {/* Icon actions */}
          <div className="header-icon-actions">
            {isDueno && (
              <button
                className="header-icon-btn"
                onClick={() => navigate("/admins")}
                title="Administración"
                aria-label="Ir a administración"
              >
                <span className="material-symbols-outlined" style={{ fontSize: "22px" }}>
                  settings
                </span>
              </button>
            )}
          </div>

          {/* Divider */}
          <div className="header-divider" />

          {/* Profile */}
          <div className="header-profile">
            <div className="header-profile-text">
              <p className="header-profile-name">
                {fullName || "Administrador"}
              </p>
              <p className="header-profile-role">
                {admin?.rol || "Admin"}
              </p>
            </div>
            <div className="avatar-initials">
              {initials}
              <div className="online-dot" />
            </div>
          </div>

          {/* Logout */}
          <div className="header-logout-wrapper">
            <button
              className="logout-btn-header"
              onClick={logout}
            >
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                logout
              </span>
              Cerrar Sesión
            </button>
          </div>
        </div>
      </header>
    </>
  );
}
