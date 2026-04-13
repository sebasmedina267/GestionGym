import { useEffect } from "react";

export default function Modal({
  open,
  onClose,
  title = "",
  children,
  size = "md",
  hideHeader = false,
  className = "",
  clean = false, // Added clean prop
}) {
  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [onClose]);

  if (!open) return null;

  const sizes = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-2xl",
  };

  /**
   * If 'clean' is true, we don't render the wrapper '.modal' div, 
   * the header, or the content padding. This allows the children 
   * to provide their own full-bleed containers (for the Kinetic Architect look).
   */
  if (clean) {
    return (
      <div className={`modal-overlay ${className}`} onClick={onClose} style={{ zIndex: 2000 }}>
        <div onClick={(e) => e.stopPropagation()} style={{ width: '100%', display: 'flex', justifyContent: 'center' }}>
          {children}
        </div>
      </div>
    );
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div
        className={`modal ${sizes[size]} ${className}`.trim()}
        onClick={(e) => e.stopPropagation()}
      >
        {!hideHeader && (
          <div className="modal-header">
            <h2>{title}</h2>
            <button className="modal-close" onClick={onClose}>
              x
            </button>
          </div>
        )}
        <div className="modal-content">{children}</div>
      </div>
    </div>
  );
}
