import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./ClientProfile.css";

export default function ClientProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const response = await api.get("/client/dashboard/profile");
      const data = response.data.data;
      setProfile(data);
      setFormData({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      notifyError("No pudimos cargar tu perfil");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patch("/client/dashboard/profile", formData);
      success("Perfil actualizado con éxito");
      fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      notifyError("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (loading) {
    return (
      <div className="client-profile-loading">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="client-profile-container">
      {/* Header */}
      <header className="client-profile-header">
        <div className="client-profile-header__top">
          <Link to="/client/dashboard" className="client-profile-back-link">
            &larr; Volver al Dashboard
          </Link>
          <div className="client-profile-logo">
            <span className="client-profile-logo__text">Mi Perfil</span>
          </div>
          <button onClick={handleLogout} className="client-profile-logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="client-profile-main">
        <section className="client-profile-section">
          <h2>Datos Personales</h2>
          <form onSubmit={handleSubmit} className="client-profile-form">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="profile-input"
              />
            </div>
            
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="profile-input disabled-input"
              />
              <small className="input-hint">El email no se puede modificar.</small>
            </div>

            <div className="form-group">
              <label>Suscripción</label>
              <input
                type="text"
                value={profile?.tipo_suscripcion || "N/A"}
                disabled
                className="profile-input disabled-input"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={saving} className="btn-primary-large">
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </section>

        {/* Transactions / History (Placeholder) */}
        <section className="client-profile-section mt-8">
          <h2>Historial de Actividad</h2>
          <div className="placeholder-card">
            <div className="placeholder-icon">📈</div>
            <p className="placeholder-text">
              Próximamente podrás ver aquí tu historial de transacciones y compras en el gimnasio.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
}
