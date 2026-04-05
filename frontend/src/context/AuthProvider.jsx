import { useState } from "react";
import api from "../api/axios";
import { AuthContext } from "./AuthContext";

export function AuthProvider({ children }) {

  const [admin, setAdmin] = useState(() => {
    const stored = localStorage.getItem("admin");
    return stored ? JSON.parse(stored) : null;
  });

  const loading = false;

  /* ============================
     LOGIN
  ============================ */
  const login = async (nombre, apellido, password) => {
    const { data } = await api.post("/auth/login", {
      nombre,
      apellido,
      password,
    });

    const { admin, gyms, roles, token } = data.data;

    // ESTRUCTURA LIMPIA
    const userData = {
      id: admin.id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      gyms,
      roles,
    };

    localStorage.setItem("token", token);
    localStorage.setItem("admin", JSON.stringify(userData));

    setAdmin(userData);
  };

  /* ============================
     REGISTER OWNER
  ============================ */
  const registerOwner = async (form) => {
    const { data } = await api.post("/auth/register-owner", form);

    const { admin, gyms, roles, token } = data.data;

    const userData = {
      id: admin.id,
      nombre: admin.nombre,
      apellido: admin.apellido,
      gyms,
      roles,
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