export default function Input({
  label,
  value,
  onChange,
  type = "text",
  placeholder = "",
  error = "",
  className = "",
}) {
  return (
    <div className={`form-group ${className}`.trim()}>
      {label && <label>{label}</label>}

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        onChange={(e) => onChange(e.target.value)}
      />

      {error && <span className="error-text">{error}</span>}
    </div>
  );
}
