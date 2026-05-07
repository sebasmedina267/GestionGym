import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./Styles/RegisterForm.css";

/**
 * RegisterForm Component
 * 
 * A high-density, authoritative registration form tailored for both Organization Owners 
 * and standard App Users.
 * 
 * Features:
 * - Role-conditional field rendering (Gym details for Owners vs. simple profile for Users).
 * - Real-time password visibility toggles.
 * - Multi-part form support for asset uploads (Gym photos).
 * - Integrated validation feedback and server-side error banners.
 * - Kinetic UI aesthetic with glassmorphism and animated transitions.
 * 
 * Props:
 * @param {Object} form - Reactive state containing all registration attributes.
 * @param {Object} errors - Mapping of field identifiers to validation messages.
 * @param {boolean} loading - Submission state guard to prevent duplicate requests.
 * @param {string} success - Success message for post-registration feedback.
 * @param {boolean} isOwner - Boolean flag derived from role selection to toggle UI paths.
 * @param {Function} handleInputChange - Handler for string/numeric inputs.
 * @param {Function} handleFileChange - Handler for file/binary inputs.
 * @param {Function} handleSubmit - Orchestrator for the registration API lifecycle.
 */
const RegisterForm = ({
    form,
    errors,
    loading,
    success,
    isOwner,
    handleInputChange,
    handleFileChange,
    handleSubmit,
}) => {

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    return (
        <form className="register-form-wrapper" onSubmit={handleSubmit}>
            {/* Global Communication Layer: Displaying high-level feedback */}
            {errors.general && (
                <div className="register-alert register-alert-error">
                    <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>error</span>
                    <span>{errors.general}</span>
                </div>
            )}
            {success && (
                <div className="register-alert register-alert-success">
                    <span className="material-symbols-outlined" style={{ fontSize: "1rem" }}>check_circle</span>
                    <span>{success}</span>
                </div>
            )}

            {/* Identity Layer: Core personal identification attributes */}
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

            {/* Connectivity & Role Layer: Routing the user through the appropriate platform tier */}
            <div className="register-form-row">
                <div className="register-field-group">
                    <label className="register-field-label">Correo Electrónico</label>
                    <div className="register-input-container">
                        <span className="material-symbols-outlined register-input-icon">mail</span>
                        <input
                            className={`register-input ${errors.email ? 'register-input--error' : ''}`}
                            placeholder="tu@correo.com"
                            type="email"
                            value={form.email}
                            onChange={(e) => handleInputChange("email", e.target.value)}
                            required
                        />
                    </div>
                    {errors.email && <p className="register-error-text">{errors.email}</p>}
                </div>

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
                            <option value="USUARIO">Usuario (Cliente App)</option>
                        </select>
                        <span className="material-symbols-outlined register-select-arrow">expand_more</span>
                    </div>
                </div>
            </div>

            {/* Professional Tier (Owner): Infrastructure and Branding configuration */}
            {isOwner && (
                <>
                    <div className="register-form-row">
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
                        <div className="register-field-group">
                            <label className="register-field-label">Dirección Web <span className="register-field-label--optional">(Opcional)</span></label>
                            <div className="register-input-container">
                                <span className="material-symbols-outlined register-input-icon">language</span>
                                <input
                                    className="register-input"
                                    placeholder="https://tufitness.com"
                                    type="url"
                                    value={form.gymUrlWeb}
                                    onChange={(e) => handleInputChange("gymUrlWeb", e.target.value)}
                                />
                            </div>
                        </div>
                    </div>
                    <div className="register-form-row">
                        <div className="register-field-group">
                            <label className="register-field-label">Dirección Física <span className="register-field-label--optional">(Opcional)</span></label>
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
                        <div className="register-field-group">
                            <label className="register-field-label">Foto del Gimnasio <span className="register-field-label--optional">(Opcional)</span></label>
                            <div className="register-input-container">
                                <span className="material-symbols-outlined register-input-icon">image</span>
                                <input
                                    className="register-input"
                                    type="file"
                                    accept="image/*"
                                    onChange={(e) => handleFileChange("gymFoto", e.target.files[0])}
                                    style={{ padding: "8px 12px" }}
                                />
                            </div>
                        </div>
                    </div>
                </>
            )}

            {/* Security Layer: Credential definition and verification */}
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

            {/* Execution Layer: Primary call to action with dynamic role-based messaging */}
            <button
                className="register-submit-btn"
                type="submit"
                disabled={loading}
            >
                <span>
                    {loading ? "Registrando..." : (isOwner ? "Ir al Pago (Stripe)" : "Crear Cuenta")}
                </span>
                {!loading && <span className="material-symbols-outlined btn-icon-animate" style={{ fontSize: "1.25rem" }}>arrow_forward</span>}
            </button>

            {/* Navigation: Contextual link for existing platform members */}
            <div className="register-login-link-container">
                <p className="register-login-link-text">
                    ¿Ya tienes una cuenta? <Link to="/login" className="register-login-link">Inicia sesión</Link>
                </p>

            </div>
        </form>
    );
};

export default RegisterForm;