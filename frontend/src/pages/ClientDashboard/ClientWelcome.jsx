import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import api from "../../api/axios";
import "./ClientWelcome.css";

/**
 * ClientWelcome Component
 * 
 * Displayed to users without a gym enrollment.
 * Features:
 * - Welcome message explaining FitFlow
 * - Search for nearby gyms with geolocation
 * - View gym details and pricing
 * - Enroll with payment
 */
export default function ClientWelcome() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { success, error: notifyError, info } = useNotification();
  
  const [gyms, setGyms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searching, setSearching] = useState(false);
  const [error, setError] = useState(null);
  const [selectedGym, setSelectedGym] = useState(null);

  // Auto-search on mount
  useEffect(() => {
    searchNearbyGyms();
  }, []);

  const searchNearbyGyms = async () => {
    try {
      setSearching(true);
      setError(null);
      info("🔍 Buscando gimnasios cercanos...");

      // Get user's current location
      if (!navigator.geolocation) {
        throw new Error("Tu navegador no soporta geolocalización");
      }

      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords;

          // Search nearby gyms
          const response = await api.get("/client/gyms/near", {
            params: { lat: latitude, lng: longitude, radius: 10 },
          });

          const foundGyms = response.data?.data || [];
          setGyms(foundGyms);
          
          if (foundGyms.length > 0) {
            success(`✓ Encontramos ${foundGyms.length} gimnasios cerca de ti`);
          } else {
            notifyError("📍 No hay gimnasios disponibles en tu área");
          }
          
          setLoading(false);
        },
        (err) => {
          console.error("Geolocation error:", err);
          notifyError("⚠️ No pudimos acceder a tu ubicación. Verifica los permisos.");
          setError("No pudimos acceder a tu ubicación. Verifica los permisos de localización.");
          setLoading(false);
        }
      );
    } catch (err) {
      console.error("Error searching gyms:", err);
      notifyError(err.message || "❌ Error al buscar gimnasios");
      setError(err.message || "Error al buscar gimnasios");
      setLoading(false);
    } finally {
      setSearching(false);
    }
  };

  const handleSelectGym = async (gym) => {
    try {
      setLoading(true);
      const response = await api.get(`/client/gyms/${gym.id}/details`);
      setSelectedGym(response.data?.data);
      success(`✓ Cargado: ${gym.nombre}`);
    } catch (err) {
      console.error("Error fetching gym details:", err);
      notifyError("❌ No pudimos cargar los detalles del gimnasio");
      setError("No pudimos cargar los detalles del gimnasio");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = (gym) => {
    // Navigate to enrollment page with gym ID
    navigate("/client/enroll", { state: { gymId: gym.id, gymName: gym.nombre } });
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="client-welcome-container">
      {/* Header */}
      <header className="client-welcome-header">
        <div className="client-welcome-header__top">
          <div className="client-welcome-logo">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.86 6.29L2.71 8.43L4.14 9.86L5.57 8.43L7 9.86L3.43 13.43L4.86 14.86L6.29 13.43L14.86 22L11.43 18.57L10 20L11.43 21.43L10 22.86L12.14 25l2.14-2.14 1.43 1.43 1.43-1.43-2.14-2.14 2.14-2.14-1.43-1.43-1.43 1.43-3.57-3.57 8.57-8.57z"></path>
            </svg>
            <span className="client-welcome-logo__text">FitFlow</span>
          </div>
          <button onClick={handleLogout} className="client-welcome-logout-btn">
            Cerrar Sesión
          </button>
        </div>

        {/* Hero Section */}
        <div className="client-welcome-hero">
          <h1 className="client-welcome-hero__title">
            Bienvenido a <span className="gradient-text">FitFlow</span>
          </h1>
          <p className="client-welcome-hero__subtitle">
            Descubre los mejores gimnasios cerca de ti y comienza tu transformación fitness hoy
          </p>
          <div className="client-welcome-hero__cta">
            <button
              onClick={searchNearbyGyms}
              disabled={searching}
              className="btn-primary-large"
            >
              {searching ? "Buscando..." : "🔍 Buscar Gimnasios Cercanos"}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="client-welcome-main">
        {/* Features Section */}
        <section className="client-welcome-features">
          <h2>¿Qué es FitFlow?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🏋️</div>
              <h3>Acceso Completo</h3>
              <p>Accede a todas las clases, máquinas y servicios del gimnasio</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📅</div>
              <h3>Gestión de Clases</h3>
              <p>Apúntate a tus clases favoritas directamente desde la app</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🏆</div>
              <h3>Seguimiento</h3>
              <p>Rastrea tu progreso y controla tus objetivos fitness</p>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🛍️</div>
              <h3>Tienda Online</h3>
              <p>Compra merchandising y productos exclusivos del gym</p>
            </div>
          </div>
        </section>

        {/* Loading State */}
        {loading && !selectedGym && (
          <div className="client-welcome-loading">
            <div className="spinner"></div>
            <p>Cargando gimnasios cercanos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="client-welcome-error">
            <p>⚠️ {error}</p>
            <button onClick={searchNearbyGyms} className="btn-secondary">
              Reintentar búsqueda
            </button>
          </div>
        )}

        {/* No gyms found */}
        {!loading && !error && gyms.length === 0 && !selectedGym && (
          <div className="client-welcome-empty">
            <p>No encontramos gimnasios en tu área</p>
            <button onClick={searchNearbyGyms} className="btn-primary">
              Buscar de nuevo
            </button>
          </div>
        )}

        {/* Gyms List & Details */}
        {!loading && gyms.length > 0 && (
          <div className="client-welcome-content">
            {/* Gyms List */}
            <section className="client-welcome-gyms">
              <h2>Gimnasios Cercanos ({gyms.length})</h2>
              <div className="gyms-list">
                {gyms.map((gym) => (
                  <div
                    key={gym.id}
                    className={`gym-list-item ${selectedGym?.id === gym.id ? "active" : ""}`}
                    onClick={() => handleSelectGym(gym)}
                  >
                    <div className="gym-list-item__header">
                      <h3>{gym.nombre}</h3>
                      <span className="gym-list-item__distance">
                        📍 {gym.distancia_km?.toFixed(1)} km
                      </span>
                    </div>
                    <p className="gym-list-item__location">
                      {gym.ciudad || gym.direccion}
                    </p>
                    <div className="gym-list-item__stats">
                      <span>👥 {gym.miembros_activos || 0} miembros</span>
                      <span>💪 {gym.total_maquinas || 0} máquinas</span>
                      <span>🏋️ {gym.total_clases || 0} clases</span>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Gym Details */}
            {selectedGym && (
              <section className="client-welcome-details">
                <div className="gym-detail-card">
                  {/* Header */}
                  <div className="gym-detail-header">
                    <h2>{selectedGym.nombre}</h2>
                    <span className="gym-detail-rating">
                      ⭐ 4.5 ({selectedGym.total_resenas || 0} reseñas)
                    </span>
                  </div>

                  {/* Image */}
                  {selectedGym.foto && (
                    <img
                      src={`/uploads/${selectedGym.foto}`}
                      alt={selectedGym.nombre}
                      className="gym-detail-image"
                    />
                  )}

                  {/* Info Sections */}
                  <div className="gym-detail-sections">
                    {/* Location & Hours */}
                    <div className="gym-detail-section">
                      <h3>📍 Ubicación e Información</h3>
                      <p>
                        <strong>Dirección:</strong> {selectedGym.direccion}
                      </p>
                      <p>
                        <strong>Ciudad:</strong> {selectedGym.ciudad}
                      </p>
                      <p>
                        <strong>Horario:</strong> {selectedGym.horario_inicio} - {selectedGym.horario_fin}
                      </p>
                      {selectedGym.telefono && (
                        <p>
                          <strong>Teléfono:</strong>{" "}
                          <a href={`tel:${selectedGym.telefono}`}>{selectedGym.telefono}</a>
                        </p>
                      )}
                    </div>

                    {/* Classes */}
                    <div className="gym-detail-section">
                      <h3>🏋️ Clases Disponibles</h3>
                      {selectedGym.clases && selectedGym.clases.length > 0 ? (
                        <ul className="classes-list">
                          {selectedGym.clases.map((clase) => (
                            <li key={clase.id}>
                              <strong>{clase.nombre}</strong>
                              <br />
                              <small>
                                {clase.horario_inicio} - {clase.horario_fin} |{" "}
                                ${clase.precio}
                              </small>
                            </li>
                          ))}
                        </ul>
                      ) : (
                        <p className="text-gray-400">
                          No hay clases disponibles en este momento
                        </p>
                      )}
                    </div>

                    {/* Equipment */}
                    <div className="gym-detail-section">
                      <h3>💪 Equipamiento</h3>
                      <p>
                        Total de máquinas:{" "}
                        <strong>{selectedGym.total_maquinas || 0}</strong>
                      </p>
                      {selectedGym.maquinas && selectedGym.maquinas.length > 0 && (
                        <ul className="machines-list">
                          {selectedGym.maquinas.slice(0, 5).map((maquina) => (
                            <li key={maquina.id}>• {maquina.nombre}</li>
                          ))}
                          {selectedGym.maquinas.length > 5 && (
                            <li>
                              • +{selectedGym.maquinas.length - 5} más...
                            </li>
                          )}
                        </ul>
                      )}
                    </div>

                    {/* Pricing */}
                    <div className="gym-detail-section pricing-section">
                      <h3>💳 Precios</h3>
                      {selectedGym.precio_cuota_mensual ? (
                        <div className="price-card">
                          <p className="price-label">Membresía Mensual</p>
                          <p className="price-value">
                            ${selectedGym.precio_cuota_mensual.toFixed(2)}
                          </p>
                          <p className="price-description">
                            Acceso ilimitado al gimnasio
                          </p>
                        </div>
                      ) : (
                        <p className="text-gray-400">
                          Contacta al gimnasio para información de precios
                        </p>
                      )}
                    </div>
                  </div>

                  {/* CTA Button */}
                  <div className="gym-detail-cta">
                    <button
                      onClick={() => handleEnroll(selectedGym)}
                      className="btn-primary-large"
                    >
                      💳 Apuntarme a este Gym
                    </button>
                    <p className="cta-info">
                      Se requiere pago para confirmar tu membresía
                    </p>
                  </div>
                </div>
              </section>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
