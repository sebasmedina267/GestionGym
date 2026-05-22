import { useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {

  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("admin");
    if (!stored) return null;
    const parsed = JSON.parse(stored);
    return parsed.tipo ? parsed : { ...parsed, tipo: "ADMIN" };
  });

  const loading = false;

  /* ============================
     LOGIN
  ============================ */
  const login = async (email, password) => {
    // Use unified endpoint that works for both admins and clients
    const { data } = await api.post("/auth/login-unified", {
      email,
      password,
    });

    const { tipo, token } = data.data;

    // Handle different user types
    if (tipo === "ADMIN") {
      const { admin: userAdmin, gyms, roles } = data.data;
      const userData = {
        id: userAdmin.id,
        nombre: userAdmin.nombre,
        apellido: userAdmin.apellido,
        email: userAdmin.email,
        gyms,
        roles,
        tipo: "ADMIN",
      };
      localStorage.setItem("token", token);
      localStorage.setItem("admin", JSON.stringify(userData));
      setAdmin(userData);
    } else if (tipo === "USUARIO_FINAL") {
      // Client user - redirect handled in router
      const { user, gyms } = data.data;
      const userData = {
        id: user.id,
        nombre: user.nombre,
        apellido: user.apellido,
        email: user.email,
        tipo: "USUARIO_FINAL",
        gyms: gyms || [],
      };
      localStorage.setItem("token", token);
      localStorage.setItem("admin", JSON.stringify(userData));
      setAdmin(userData);
    }
  };

  /* ============================
     REGISTER OWNER
  ============================ */
  const registerOwner = async (form) => {
    const { data } = await api.post("/auth/register-owner", form);

    const { admin: userAdmin, gyms, roles, token } = data.data;

    const userData = {
      id: userAdmin.id,
      nombre: userAdmin.nombre,
      apellido: userAdmin.apellido,
      email: userAdmin.email,
      gyms,
      roles,
      tipo: "ADMIN",
    };

    localStorage.setItem("token", token);
    localStorage.setItem("admin", JSON.stringify(userData));

    setAdmin(userData);
  };

  /* ============================
     LOGOUT
  ============================ */
  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("admin");
    setAdmin(null);
  };

  return (
    <AuthContext.Provider
      value={{
        admin,
        loading,
        login,
        registerOwner,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
