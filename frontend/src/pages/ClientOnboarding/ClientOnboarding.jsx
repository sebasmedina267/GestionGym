/**
 * Client Onboarding Page
 * 
 * First page shown to users without a gym.
 * Allows searching for nearby gyms.
 */

import { useRef, useEffect, useContext, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import { useGymDiscovery } from "../../hooks/useGymDiscovery";
import "./ClientOnboarding.css";

export default function ClientOnboarding() {
  const {
    gyms,
    loading,
    error,
    searchNearbyFromCurrentLocation,
    getGymDetails,
    selectedGym
  } = useGymDiscovery();

  const navigate = useNavigate();
  const { logout } = useContext(AuthContext);

  const hasRequested = useRef(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleSearchNearby = useCallback(async () => {
    try {
      await searchNearbyFromCurrentLocation(5);
    } catch (err) {
      console.error("Error searching gyms:", err);
    }
  }, [searchNearbyFromCurrentLocation]);

  // Automatically try to search on mount
  useEffect(() => {
    if (!hasRequested.current) {
      hasRequested.current = true;
      handleSearchNearby();
    }
  }, [handleSearchNearby]);

  const handleSelectGym = async (gym) => {
    try {
      await getGymDetails(gym.id);
    } catch (err) {
      console.error("Error fetching gym details:", err);
    }
  };

  return (
    <div className="client-onboarding">
      {/* Header */}
      <header className="client-onboarding__header">
        <div className="client-onboarding__hero">
          <h1>Bienvenido a FitFlow</h1>
          <p>Encuentra tu gimnasio perfecto</p>
        </div>
        <button className="client-onboarding__logout-btn" onClick={handleLogout}>
          Cerrar Sesión
        </button>
      </header>

      {/* Main Content */}
      <main className="client-onboarding__main">
        {/* Loading State */}
        {loading && (
          <div className="client-onboarding__loading">
            <div className="spinner"></div>
            <p>Buscando gimnasios cercanos...</p>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="client-onboarding__error">
            <p>⚠️ {error}</p>
            <button onClick={handleSearchNearby} className="btn btn--primary">
              Reintentar búsqueda
            </button>
          </div>
        )}

        {/* Gyms List */}
        {!loading && !error && (
          <div className="client-onboarding__content">
            <div className="client-onboarding__gyms-list">
              <h2>Gimnasios cercanos ({gyms.length})</h2>

              {gyms.length === 0 ? (
                <div className="client-onboarding__empty">
                  <p>No encontramos gimnasios en tu área</p>
                  <button onClick={handleSearchNearby} className="btn btn--primary">
                    Buscar de nuevo
                  </button>
                </div>
              ) : (
                <div className="client-onboarding__gym-cards">
                  {gyms.map((gym) => (
                    <div
                      key={gym.id}
                      className="gym-card"
                      onClick={() => handleSelectGym(gym)}
                    >
                      {gym.foto && (
                        <img
                          src={`/uploads/${gym.foto}`}
                          alt={gym.nombre}
                          className="gym-card__image"
                        />
                      )}

                      <div className="gym-card__content">
                        <h3>{gym.nombre}</h3>
                        <p className="gym-card__location">{gym.ciudad || gym.direccion}</p>

                        <div className="gym-card__stats">
                          <span className="stat">
                            📍 {gym.distancia_km.toFixed(1)} km
                          </span>
                          <span className="stat">👥 {gym.miembros_activos} miembros</span>
                          <span className="stat">💪 {gym.total_maquinas} máquinas</span>
                          <span className="stat">🏋️ {gym.total_clases} clases</span>
                        </div>

                        {gym.horario_inicio && (
                          <p className="gym-card__hours">
                            ⏰ {gym.horario_inicio} - {gym.horario_fin}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Gym Details Sidebar */}
            {selectedGym && (
              <div className="client-onboarding__details">
                <div className="gym-detail-card">
                  {selectedGym.foto && (
                    <img
                      src={`/uploads/${selectedGym.foto}`}
                      alt={selectedGym.nombre}
                      className="gym-detail-card__image"
                    />
                  )}

                  <div className="gym-detail-card__content">
                    <h2>{selectedGym.nombre}</h2>

                    <div className="detail-section">
                      <h4>Ubicación</h4>
                      <p>{selectedGym.direccion}</p>
                      <p>{selectedGym.ciudad}</p>
                    </div>

                    <div className="detail-section">
                      <h4>Horario</h4>
                      <p>
                        {selectedGym.horario_inicio} - {selectedGym.horario_fin}
                      </p>
                    </div>

                    {selectedGym.telefono && (
                      <div className="detail-section">
                        <h4>Contacto</h4>
                        <p>📞 {selectedGym.telefono}</p>
                        {selectedGym.email_contacto && (
                          <p>📧 {selectedGym.email_contacto}</p>
                        )}
                      </div>
                    )}

                    <div className="detail-section">
                      <h4>Instalaciones</h4>
                      <ul>
                        <li>💪 {selectedGym.total_maquinas} máquinas</li>
                        <li>🏋️ {selectedGym.total_clases} clases disponibles</li>
                        <li>🛍️ {selectedGym.total_productos} productos</li>
                        <li>👥 {selectedGym.miembros_activos} miembros activos</li>
                      </ul>
                    </div>

                    <button className="btn btn--primary btn--block">
                      Ver más detalles
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
