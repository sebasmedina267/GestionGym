export default function GymCard({ gym, resolvePhoto, onEdit, dimmed = false }) {
  const photoUrl = resolvePhoto(gym.foto);
  return (
    <div style={{
      background: "var(--bg-secondary)",
      border: "1px solid var(--border-color)",
      borderRadius: "14px",
      overflow: "hidden",
      opacity: dimmed ? 0.7 : 1,
      transition: "transform 0.2s, box-shadow 0.2s",
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = "translateY(-3px)"; e.currentTarget.style.boxShadow = "0 8px 24px rgba(0,0,0,0.3)"; }}
      onMouseLeave={e => { e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
    >
      {/* Foto del gym */}
      <div style={{ height: "160px", background: "var(--bg-tertiary)", overflow: "hidden", display: "flex", alignItems: "center", justifyContent: "center" }}>
        {photoUrl ? (
          <img
            src={photoUrl}
            alt={`Foto de ${gym.nombre}`}
            style={{ width: "100%", height: "100%", objectFit: "cover" }}
            onError={e => { e.target.style.display = "none"; e.target.nextSibling.style.display = "flex"; }}
          />
        ) : null}
        <div style={{
          display: photoUrl ? "none" : "flex",
          alignItems: "center", justifyContent: "center",
          width: "100%", height: "100%",
          fontSize: "3rem", color: "var(--text-tertiary)"
        }}>
          🏋️
        </div>
      </div>

      {/* Info */}
      <div style={{ padding: "16px" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <h4 style={{ margin: "0 0 4px 0", fontSize: "1.05rem", fontWeight: 700, color: "var(--text-primary)" }}>
              {gym.nombre}
            </h4>
            {gym.ciudad && (
              <p style={{ margin: "0 0 2px 0", fontSize: "0.85rem", color: "var(--primary)", fontWeight: 500 }}>
                📍 {gym.ciudad}
              </p>
            )}
            {gym.direccion && (
              <p style={{ margin: 0, fontSize: "0.82rem", color: "var(--text-secondary)" }}>
                {gym.direccion}
              </p>
            )}
          </div>
          {onEdit && (
            <button
              onClick={() => onEdit(gym)}
              style={{
                background: "var(--bg-tertiary)", border: "1px solid var(--border-color)",
                color: "var(--text-primary)", padding: "6px 12px", borderRadius: "8px",
                cursor: "pointer", fontSize: "0.8rem", flexShrink: 0, marginLeft: "8px"
              }}
            >
              ✏️ Editar
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
