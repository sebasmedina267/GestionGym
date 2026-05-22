import { useContext } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ProtectedRoute({ children, allowedType = "ADMIN" }) {
  const { admin, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return <p>Cargando...</p>;
  if (!admin) return <Navigate to="/login" state={{ from: location }} replace />;

  if (allowedType && admin.tipo !== allowedType) {
    const fallback = admin.tipo === "USUARIO_FINAL" ? "/client/dashboard" : "/select-gym";
    return <Navigate to={fallback} replace />;
  }

  return children;
}
