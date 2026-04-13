import "./Styles/GymCard.css";

export default function GymCard({ gym, resolvePhoto, onEdit, dimmed = false }) {
  const photoUrl = resolvePhoto(gym.foto);
  return (
    <div className={`gym-card ${dimmed ? "gym-card--dimmed" : ""}`}>
      {/* Foto del gym */}
      <div className="gym-card__image-container">
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`Foto de ${gym.nombre}`}
            className="gym-card__image"
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <div className="gym-card__placeholder">
          🏋️
        </div>
      </div>

      {/* Info */}
      <div className="gym-card__content">
        <div className="gym-card__header">
          <div>
            <h4 className="gym-card__title">
              {gym.nombre}
            </h4>
            {gym.ciudad && (
              <p className="gym-card__city">
                📍 {gym.ciudad}
              </p>
            )}
            {gym.direccion && (
              <p className="gym-card__address">
                {gym.direccion}
              </p>
            )}
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(gym)}
              className="gym-card__edit-btn"
            >
              ✏️ Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
