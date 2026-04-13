import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./Sidebar.css";

// Nav items configuration
const NAV_ITEMS = [
  { to: "/", end: true, icon: "dashboard", label: "Dashboard" },
  { section: "Gestión de Miembros" },
  { to: "/clientes", icon: "group", label: "Clientes" },
  { to: "/clases", icon: "fitness_center", label: "Clases" },
  { section: "Gestión Financiera" },
  { to: "/pagos", icon: "payments", label: "Pagos" },
  { to: "/economia", icon: "analytics", label: "Economía" },
  { section: "Inventario" },
  { to: "/productos", icon: "inventory_2", label: "Productos" },
  { to: "/maquinas", icon: "precision_manufacturing", label: "Máquinas" },
];

const ADMIN_ITEM = { to: "/admins", icon: "admin_panel_settings", label: "Administradores" };

export default function Sidebar() {
  const { admin } = useContext(AuthContext);
  const isDueno = admin?.roles?.includes("DUENO");

  const allItems = isDueno
    ? [...NAV_ITEMS, { section: "Administración" }, ADMIN_ITEM]
    : NAV_ITEMS;

  return (
    <aside className="sidebar-aside">

      {/* Logo Header */}
      <div className="sidebar-logo-header">
        <div className="sidebar-logo-icon-container">
          <span className="material-symbols-outlined sidebar-logo-icon">
            bolt
          </span>
        </div>
        <div>
          <h1 className="sidebar-logo-title">
            FitFlow
          </h1>
          <p className="sidebar-logo-subtitle">
            Management Engine
          </p>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav-container">
        <ul className="sidebar-nav-list">
          {allItems.map((item, idx) => {
            // Section label
            if (item.section) {
              return (
                <li key={`section-${idx}`} className="sidebar-section-label">
                  {item.section}
                </li>
              );
            }

            // Nav link
            return (
              <li key={item.to}>
                <NavLink
                  to={item.to}
                  end={item.end}
                  className={({ isActive }) => 
                    `sidebar-nav-link ${isActive ? 'active' : ''}`
                  }
                >
                  <span className="material-symbols-outlined sidebar-nav-icon">
                    {item.icon}
                  </span>
                  {item.label}
                </NavLink>
              </li>
            );
          })}
        </ul>
      </nav>
    </aside>
  );
}
