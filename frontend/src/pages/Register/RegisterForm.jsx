import React, { useState } from "react";
import "./Styles/RegisterForm.css";

const RegisterForm = ({
    form,
    errors,
    loading,
    success,
    isOwner,
    gymsLoading,
    gymsList,
    handleInputChange,
    handleSubmit,
}) => {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <form className="register-form-wrapper" onSubmit={handleSubmit}>
            {/* Mensajes de Éxito/Error Generales */}
            {errors.general && (
                <div className="register-alert register-alert-error">
                    <span className="material-symbols-outlined" style={{fontSize: "1rem"}}>error</span>
                    <span>{errors.general}</span>
                </div>
            )}
            {success && (
                <div className="register-alert register-alert-success">
                    <span className="material-symbols-outlined" style={{fontSize: "1rem"}}>check_circle</span>
                    <span>{success}</span>
                </div>
            )}

            {/* Fila de Nombres */}
            <div className="register-form-row">
                <div className="register-field-group">
                    <label className="register-field-label">Nombre</label>
                    <div className="register-input-container">
                        <span className="material-symbols-outlined register-input-icon">person</span>
                        <input
                            className={`register-input ${errors.nombre ? 'register-input--error' : ''}`}
                            placeholder="Ej. Alex"
                            type="text"
                            value={form.nombre}
                            onChange={(e) => handleInputChange("nombre", e.target.value)}
                            required
                        />
                    </div>
                    {errors.nombre && <p className="register-error-text">{errors.nombre}</p>}
                </div>
                <div className="register-field-group">
                    <label className="register-field-label">Apellido</label>
                    <div className="register-input-container">
                        <span className="material-symbols-outlined register-input-icon">person</span>
                        <input
                            className={`register-input ${errors.apellido ? 'register-input--error' : ''}`}
                            placeholder="Ej. Sterling"
                            type="text"
                            value={form.apellido}
                            onChange={(e) => handleInputChange("apellido", e.target.value)}
                            required
                        />
                    </div>
                    {errors.apellido && <p className="register-error-text">{errors.apellido}</p>}
                </div>
            </div>

            {/* Fila de Identidad */}
            <div className="register-form-row">
                <div className="register-field-group">
                    <label className="register-field-label">Rol de Acceso</label>
                    <div className="register-input-container">
                        <span className="material-symbols-outlined register-input-icon">admin_panel_settings</span>
                        <select
                            className="register-select"
                            value={form.rol}
                            onChange={(e) => handleInputChange("rol", e.target.value)}
                        >
                            <option value="DUENO">Dueño</option>
                            <option value="TRABAJADOR">Empleado</option>
                        </select>
                        <span className="material-symbols-outlined register-select-arrow">expand_more</span>
                    </div>
                </div>

                {isOwner ? (
                    <div className="register-field-group">
                        <label className="register-field-label">Nombre del Gimnasio</label>
                        <div className="register-input-container">
                            <span className="material-symbols-outlined register-input-icon">fitness_center</span>
                            <input
                                className={`register-input ${errors.gymNombre ? 'register-input--error' : ''}`}
                                placeholder="Ej. Iron Haven HQ"
                                type="text"
                                value={form.gymNombre}
                                onChange={(e) => handleInputChange("gymNombre", e.target.value)}
                                required
                            />
                        </div>
                        {errors.gymNombre && <p className="register-error-text">{errors.gymNombre}</p>}
                    </div>
                ) : (
                    <div className="register-field-group">
                        <label className="register-field-label">Seleccionar Gimnasio</label>
                        <div className="register-input-container">
                            <span className="material-symbols-outlined register-input-icon">fitness_center</span>
                            {gymsLoading ? (
                                <div className="register-input" style={{display: "flex", alignItems: "center"}}>
                                    Cargando...
                                </div>
                            ) : (
                                <select
                                    className={`register-select ${errors.gymId ? 'register-input--error' : ''}`}
                                    value={form.gymId}
                                    onChange={(e) => handleInputChange("gymId", e.target.value)}
                                    required
                                >
                                    <option value="">Elige ubicación</option>
                                    {gymsList.map((g) => (
                                        <option key={g.id} value={g.id}>
                                            {g.nombre}
                                        </option>
                                    ))}
                                </select>
                            )}
                            {!gymsLoading && <span className="material-symbols-outlined register-select-arrow">expand_more</span>}
                        </div>
                        {errors.gymId && <p className="register-error-text">{errors.gymId}</p>}
                    </div>
                )}
            </div>

            {/* Fila de Contraseña */}
            <div className="register-form-row">
                <div className="register-field-group">
                    <label className="register-field-label">Contraseña</label>
                    <div className="register-input-container">
                        <span className="material-symbols-outlined register-input-icon">lock</span>
                        <input
                            className={`register-input ${errors.password ? 'register-input--error' : ''}`}
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            required
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="material-symbols-outlined register-password-toggle"
                        >
                            {showPassword ? "visibility_off" : "visibility"}
                        </span>
                    </div>
                    {errors.password && <p className="register-error-text">{errors.password}</p>}
                </div>

                <div className="register-field-group">
                    <label className="register-field-label">Confirmar</label>
                    <div className="register-input-container">
                        <span className="material-symbols-outlined register-input-icon">verified_user</span>
                        <input
                            className={`register-input ${errors.confirmPassword ? 'register-input--error' : ''}`}
                            placeholder="••••••••"
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            required
                        />
                        <span
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="material-symbols-outlined register-password-toggle"
                        >
                            {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                    </div>
                    {errors.confirmPassword && <p className="register-error-text">{errors.confirmPassword}</p>}
                </div>
            </div>

            {/* Dirección Opcional */}
            {isOwner && (
                <div className="register-field-group">
                    <label className="register-field-label">
                        Dirección del Gimnasio <span className="register-field-label--optional">(Opcional)</span>
                    </label>
                    <div className="register-input-container">
                        <span className="material-symbols-outlined register-input-icon">location_on</span>
                        <input
                            className="register-input"
                            placeholder="Ej. Calle Rendimiento 123"
                            type="text"
                            value={form.gymDireccion}
                            onChange={(e) => handleInputChange("gymDireccion", e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* CTA */}
            <button
                className="register-submit-btn"
                type="submit"
                disabled={loading}
            >
                <span>
                    {loading ? "Registrando..." : "Registrar Administrador"}
                </span>
                {!loading && <span className="material-symbols-outlined btn-icon-animate" style={{fontSize: "1.25rem"}}>arrow_forward</span>}
            </button>
        </form>
    );
};

export default RegisterForm;