import React from 'react';
import Modal from "../../components/ui/Modal";
import Input from "../../components/ui/Input";
import Button from "../../components/ui/Button";

export default function CreateAdminModal({
  open, setOpen,
  photoPreview, setPhotoPreview,
  handlePhotoChange,
  form, setForm,
  errors,
  validatePassword,
  passwordValid,
  gyms,
  saving,
  handleCreate
}) {

  return (
    <Modal
      open={open}
      onClose={() => {
        setOpen(false);
        setPhotoPreview(null);
      }}
      title="Dar de Alta un Empleado"
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>

        {/* Foto */}
        <div style={{ textAlign: "center" }}>
          <div
            style={{
              width: "100px",
              height: "100px",
              borderRadius: "50%",
              background: "var(--bg-tertiary)",
              margin: "0 auto 16px",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              overflow: "hidden"
            }}
          >
            {photoPreview ? (
              <img
                src={photoPreview}
                alt="Preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            ) : (
              <span style={{ fontSize: "40px" }}>📷</span>
            )}
          </div>

          <label
            style={{
              padding: "8px 16px",
              background: "var(--primary-alpha)",
              color: "var(--primary-light)",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "600",
              fontSize: "0.85rem",
              display: "inline-block",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.target.style.background = "var(--primary)";
              e.target.style.color = "white";
            }}
            onMouseLeave={(e) => {
              e.target.style.background = "var(--primary-alpha)";
              e.target.style.color = "var(--primary-light)";
            }}
          >
            📸 Subir Foto
            <input
              type="file"
              accept="image/*"
              onChange={handlePhotoChange}
              style={{ display: "none" }}
            />
          </label>
        </div>

        {/* Inputs */}
        <Input
          label="Nombre"
          value={form.nombre}
          onChange={(v) => setForm({ ...form, nombre: v })}
          error={errors.nombre}
        />

        <Input
          label="Apellido"
          value={form.apellido}
          onChange={(v) => setForm({ ...form, apellido: v })}
          error={errors.apellido}
        />

        <Input
          label="Contraseña"
          type="password"
          value={form.password}
          onChange={(v) => {
            setForm({ ...form, password: v });
            if (v) validatePassword(v);
          }}
          error={errors.password}
        />

        {/* Requisitos contraseña */}
        {form.password && (
          <div
            style={{
              background: "var(--bg-tertiary)",
              padding: "12px",
              borderRadius: "8px",
              border: "1px solid var(--border-color)",
              fontSize: "0.85rem"
            }}
          >
            <p
              style={{
                color: "var(--text-secondary)",
                margin: "0 0 8px 0",
                fontWeight: "600"
              }}
            >
              Requisitos de contraseña:
            </p>

            {(() => {
              const pwd = form.password;
              const checks = [
                { label: "Mínimo 8 caracteres", valid: pwd.length >= 8 },
                { label: "Al menos 1 mayúscula (A-Z)", valid: /[A-Z]/.test(pwd) },
                { label: "Al menos 1 número (0-9)", valid: /[0-9]/.test(pwd) },
                { label: "Al menos 1 símbolo (!@#$%^&*)", valid: /[^A-Za-z0-9]/.test(pwd) }
              ];

              return checks.map((check, idx) => (
                <div
                  key={idx}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    margin: "4px 0",
                    color: check.valid
                      ? "var(--success-color, #10b981)"
                      : "var(--text-secondary)"
                  }}
                >
                  <span>{check.valid ? "✓" : "○"}</span>
                  <span>{check.label}</span>
                </div>
              ));
            })()}
          </div>
        )}

        {/* Select Gym */}
        <div>
          <label
            style={{
              display: "block",
              marginBottom: "8px",
              color: "var(--text-secondary)",
              fontSize: "0.85rem"
            }}
          >
            Asignar a Sucursal
          </label>

          <select
            value={form.gymId}
            onChange={(e) => setForm({ ...form, gymId: e.target.value })}
            style={{
              width: "100%",
              padding: "12px",
              borderRadius: "8px",
              background: "var(--bg-tertiary)",
              color: "var(--text-primary)",
              border: "1px solid var(--border-color)"
            }}
          >
            <option value="">Selecciona un gimnasio</option>
            {gyms?.map((g) => (
              <option key={g.id} value={g.id}>
                {g.nombre}
              </option>
            ))}
          </select>

          {errors.gymId && (
            <span
              style={{
                color: "var(--danger-color)",
                fontSize: "0.8rem",
                marginTop: "4px",
                display: "block"
              }}
            >
              {errors.gymId}
            </span>
          )}
        </div>

        {/* Botones */}
        <div style={{ display: "flex", gap: "12px" }}>
          <Button
            variant="secondary"
            onClick={() => {
              setOpen(false);
              setPhotoPreview(null);
            }}
          >
            Cancelar
          </Button>

          <Button
            variant="primary"
            loading={saving}
            onClick={handleCreate}
            style={{
              flex: 1,
              opacity: !passwordValid && form.password ? 0.6 : 1
            }}
          >
            Contratar
          </Button>
        </div>
      </div>
    </Modal>
  );
}
