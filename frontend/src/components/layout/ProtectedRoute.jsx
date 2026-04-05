import { useContext } from "react";
import { Navigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { admin, loading } = useContext(AuthContext);

  if (loading) return <p>Cargando...</p>;
  if (!admin) return <Navigate to="/login" />;

  return children;
}
