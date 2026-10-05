import React from "react";

export default function GymMap({ gyms = [], selectedGym, userLocation, onSelectGym }) {
  const activeGym = selectedGym || gyms[0] || null;

  const getMapQuery = () => {
    if (activeGym && Number.isFinite(activeGym.latitud) && Number.isFinite(activeGym.longitud)) {
      return `${activeGym.latitud},${activeGym.longitud}`;
    }

    if (userLocation && Number.isFinite(userLocation.latitude) && Number.isFinite(userLocation.longitude)) {
      return `${userLocation.latitude},${userLocation.longitude}`;
    }

    if (activeGym?.ciudad) {
      return activeGym.ciudad;
    }

    return "Madrid";
  };

  const mapUrl = `https://www.google.com/maps?q=${encodeURIComponent(getMapQuery())}&z=12&output=embed`;

  return (
    <div className="gym-map-panel">
      <div className="gym-map-panel__header">
        <div>
          <p className="gym-map-panel__eyebrow">Mapa</p>
          <h3>{activeGym ? activeGym.nombre : "Gimnasios cercanos"}</h3>
        </div>
        {activeGym && (
          <span className="gym-map-panel__badge">
            {activeGym.distancia_km ? `${activeGym.distancia_km.toFixed(1)} km` : "Cerca de ti"}
          </span>
        )}
      </div>

      <div className="gym-map-panel__frame">
        <iframe
          title="Mapa de gimnasios FitFlow"
          src={mapUrl}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          allowFullScreen
        />
      </div>

      <div className="gym-map-panel__list">
        {gyms.map((gym) => (
          <button
            key={gym.id}
            type="button"
            className={`gym-map-panel__item ${selectedGym?.id === gym.id ? "active" : ""}`}
            onClick={() => onSelectGym?.(gym)}
          >
            <span className="gym-map-panel__item-title">{gym.nombre}</span>
            <span className="gym-map-panel__item-meta">
              {gym.distancia_km ? `${gym.distancia_km.toFixed(1)} km` : gym.ciudad || gym.direccion}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}
