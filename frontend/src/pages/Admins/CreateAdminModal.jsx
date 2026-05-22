import React from 'react';
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import './Styles/CreateAdminModal.css';

export default function CreateAdminModal({
  open, setOpen,
  photoPreview, setPhotoPreview,
  handlePhotoChange,
  form, setForm,
  errors,
  validatePassword,
  validateEmail,
  passwordValid,
  gyms,
  saving,
  handleCreate,
  isDueno
}) {

  const closeAndReset = () => {
    setOpen(false);
    setPhotoPreview(null);
  };

  // Email validation feedback
  const isEmailValid = form.email && validateEmail(form.email);

  return (
    <Modal
      open={open}
      onClose={closeAndReset}
      clean
    >
      <div className="create-admin-modal-container">
        {/* Header with Background and Profile Picture */}
        <div className="create-admin-header-bg">
          <button className="create-admin-close-top" onClick={closeAndReset}>
            <span className="material-symbols-outlined">close</span>
          </button>
          
          <div className="create-admin-photo-wrapper">
             <div className="create-admin-photo-circle" onClick={() => document.getElementById('admin-photo-input').click()}>
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="create-admin-photo-img" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <span className="material-symbols-outlined create-admin-photo-placeholder">photo_camera</span>
                )}
             </div>
             <div className="create-admin-photo-btn-mini">
                <span className="material-symbols-outlined">add</span>
             </div>
             <input
                id="admin-photo-input"
                type="file"
                accept="image/*"
                onChange={handlePhotoChange}
                style={{ display: 'none' }}
              />
          </div>
        </div>

        <div className="create-admin-form">
          <div className="create-admin-title-area">
            <h3 className="create-admin-title">Nuevo Registro</h3>
            <p className="create-admin-subtitle">Reclutamiento de Personal</p>
          </div>

          <form className="create-admin-grid" onSubmit={(e) => { e.preventDefault(); handleCreate(); }}>
            <Input
              label="Nombre"
              value={form.nombre}
              onChange={(v) => setForm({ ...form, nombre: v })}
              error={errors.nombre}
              variant="kinetic"
              placeholder="Ej. Carlos"
            />

            <Input
              label="Apellido"
              value={form.apellido}
              onChange={(v) => setForm({ ...form, apellido: v })}
              error={errors.apellido}
              variant="kinetic"
              placeholder="Ej. Mendoza"
            />

            <div className="create-admin-full-width">
              <Input
                label="Correo Electrónico"
                type="email"
                value={form.email}
                onChange={(v) => setForm({ ...form, email: v })}
                error={errors.email}
                variant="kinetic"
                placeholder="Ej. empleado@gym.com"
                icon="mail"
              />
              {form.email && (
                <div style={{ marginTop: '0.5rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span className="material-symbols-outlined" style={{ fontSize: '16px', color: isEmailValid ? '#10b981' : '#ef4444' }}>
                    {isEmailValid ? 'check_circle' : 'error'}
                  </span>
                  <span style={{ color: isEmailValid ? '#10b981' : '#ef4444' }}>
                    {isEmailValid ? 'Correo válido' : 'Formato inválido'}
                  </span>
                </div>
              )}
            </div>

            <div className="create-admin-full-width">
              <Input
                label="Contraseña"
                type="password"
                value={form.password}
                onChange={(v) => {
                  setForm({ ...form, password: v });
                  if (v) validatePassword(v);
                }}
                error={errors.password}
                variant="kinetic"
                placeholder="••••••••••••"
                icon="lock"
              />
            </div>

            {/* Requisitos contraseña */}
            {form.password && (
              <div className="create-admin-full-width">
                <div className="create-admin-pwd-reqs">
                  <p className="create-admin-pwd-title">
                    <span className="material-symbols-outlined" style={{ fontSize: '16px', marginRight: '0.5rem', color: passwordValid ? '#10b981' : '#ef4444' }}>
                      {passwordValid ? 'check_circle' : 'info'}
                    </span>
                    Requisitos de contraseña ({passwordValid ? 'Cumplida' : 'Incompleta'}):
                  </p>
                  <div className="create-admin-pwd-list">
                    {[
                      { label: "Mínimo 8 caracteres", valid: form.password.length >= 8 },
                      { label: "Al menos 1 mayúscula (A-Z)", valid: /[A-Z]/.test(form.password) },
                      { label: "Al menos 1 número (0-9)", valid: /[0-9]/.test(form.password) },
                      { label: "Al menos 1 símbolo (!@#$%^&*)", valid: /[^A-Za-z0-9]/.test(form.password) }
                    ].map((check, idx) => (
                      <div key={idx} className={`create-admin-pwd-item ${check.valid ? 'create-admin-pwd-item-valid' : 'create-admin-pwd-item-invalid'}`}>
                        <span className="material-symbols-outlined" style={{ fontSize: '14px' }}>
                          {check.valid ? 'check_circle' : 'circle'}
                        </span>
                        <span>{check.label}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Select Role & Gym in 2 columns */}
            <div className="ka-form-group">
              <label className="ka-label">Rol del Empleado</label>
              <div className="ka-input-wrapper">
                <select
                  value={form.rol}
                  onChange={(e) => setForm({ ...form, rol: e.target.value })}
                  className="ka-select"
                >
                  <option value="EMPLEADO">Empleado (Estándar)</option>
                  {isDueno && <option value="ENCARGADO">Manager (Encargado)</option>}
                </select>
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: '1rem', pointerEvents: 'none', color: 'var(--ka-primary)' }}>expand_more</span>
              </div>
            </div>

            <div className="ka-form-group">
              <label className="ka-label">Asignar a Sucursal</label>
              <div className="ka-input-wrapper">
                <select
                  value={form.gymId}
                  onChange={(e) => setForm({ ...form, gymId: e.target.value })}
                  className="ka-select"
                >
                  <option value="" disabled>Seleccione ubicación...</option>
                  {gyms?.map((g) => (
                    <option key={g.id} value={g.id}>{g.nombre}</option>
                  ))}
                </select>
                <span className="material-symbols-outlined" style={{ position: 'absolute', right: '1rem', pointerEvents: 'none', color: 'var(--ka-primary)' }}>expand_more</span>
              </div>
              {errors.gymId && <span className="error-text-kinetic">{errors.gymId}</span>}
            </div>

            <div className="create-admin-full-width create-admin-form-actions">
              <button 
                type="button" 
                className="btn-admin-cancel" 
                onClick={closeAndReset}
                disabled={saving}
              >
                Cancelar
              </button>
              <button 
                type="submit" 
                className="btn-admin-submit"
                disabled={saving || (!passwordValid && form.password) || !form.nombre || !form.apellido || !form.email || !form.password || !form.gymId}
              >
                {saving ? (
                  <>
                    <span className="material-symbols-outlined" style={{ animation: 'spin 1s linear infinite' }}>
                      sync
                    </span>
                    Contratando...
                  </>
                ) : (
                  "Contratar"
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Modal>
  );
}
