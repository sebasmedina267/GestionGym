export default function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  error = "",
  className = "",
  variant = "default",
  icon = null
}) {
  const isKinetic = variant === "kinetic";

  return (
    <div className={`${isKinetic ? 'ka-form-group' : 'form-group'} ${className}`.trim()}>
      {label && <label className={isKinetic ? 'ka-label' : ''}>{label}</label>}

      <div className={isKinetic ? 'ka-input-wrapper' : 'input-wrapper-standard'}>
        {isKinetic && icon && (
          <span className="material-symbols-outlined ka-input-icon">{icon}</span>
        )}
        <input
          className={isKinetic ? `ka-input ${icon ? 'has-icon' : ''}` : ''}
          type={type}
          value={value}
          placeholder={placeholder}
          onChange={(e) => onChange(e.target.value)}
        />
      </div>

      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
