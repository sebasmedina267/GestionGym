import { NavLink } from "react-router-dom";
import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";

export default function Sidebar() {
  const { admin } = useContext(AuthContext);
  const isDueno = admin?.roles?.includes('DUENO');
  const linkClass = ({ isActive }) => (isActive ? "active" : "");

  return (
    <aside className="sidebar">
      <h2 style={{
        background: "linear-gradient(135deg, #10b981 0%, #14b8a6 50%, #06b6d4 100%)",
        backgroundClip: "text",
        WebkitBackgroundClip: "text",
        WebkitTextFillColor: "transparent",
        fontSize: "22px",
        fontWeight: 700,
        marginBottom: "24px",
        letterSpacing: "-0.02em"
      }}>
        💪 FitFlow
      </h2>

      <nav>
        <ul>
          <li>
            <NavLink to="/" end className={linkClass}>
              Dashboard
            </NavLink>
          </li>

          <li className="menu-title">Gestion de miembros</li>
          <li>
            <NavLink to="/clientes" className={linkClass}>
              Clientes
            </NavLink>
          </li>
          <li>
            <NavLink to="/clases" className={linkClass}>
              Clases
            </NavLink>
          </li>

          <li className="menu-title">Gestion financiera</li>
          <li>
            <NavLink to="/pagos" className={linkClass}>
              Pagos
            </NavLink>
          </li>
          <li>
            <NavLink to="/economia" className={linkClass}>
              Economia
            </NavLink>
          </li>

          <li className="menu-title">Inventario</li>
          <li>
            <NavLink to="/productos" className={linkClass}>
              Productos
            </NavLink>
          </li>
          <li>
            <NavLink to="/maquinas" className={linkClass}>
              Maquinas
            </NavLink>
          </li>

          {isDueno && (
            <>
              <li className="menu-title">Administracion</li>
              <li>
                <NavLink to="/admins" className={linkClass}>
                  Administradores
                </NavLink>
              </li>
            </>
          )}
        </ul>
      </nav>
    </aside>
  );
}
