import React, { useState } from "react";

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
        <form className="space-y-4" onSubmit={handleSubmit}>
            {/* Mensajes de Éxito/Error Generales */}
            {errors.general && (
                <div className="p-3 bg-error-container text-on-error-container rounded-xl text-xs font-medium border border-error/20">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">error</span>
                        {errors.general}
                    </div>
                </div>
            )}
            {success && (
                <div className="p-3 bg-secondary-container/20 text-secondary rounded-xl text-xs font-medium border border-secondary/20">
                    <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-sm">check_circle</span>
                        {success}
                    </div>
                </div>
            )}

            {/* Fila de Nombres */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant px-1">Nombre</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
                        <input
                            className={`w-full bg-surface-container-highest border-none focus:ring-2 ${errors.nombre ? 'focus:ring-error/50 ring-2 ring-error/30' : 'focus:ring-primary/50'} text-on-surface rounded-xl py-3 pl-12 pr-4 transition-all text-sm placeholder:text-outline/50`}
                            placeholder="Ej. Alex"
                            type="text"
                            value={form.nombre}
                            onChange={(e) => handleInputChange("nombre", e.target.value)}
                            required
                        />
                    </div>
                    {errors.nombre && <p className="text-[9px] text-error px-1">{errors.nombre}</p>}
                </div>
                <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant px-1">Apellido</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">person</span>
                        <input
                            className={`w-full bg-surface-container-highest border-none focus:ring-2 ${errors.apellido ? 'focus:ring-error/50 ring-2 ring-error/30' : 'focus:ring-primary/50'} text-on-surface rounded-xl py-3 pl-12 pr-4 transition-all text-sm placeholder:text-outline/50`}
                            placeholder="Ej. Sterling"
                            type="text"
                            value={form.apellido}
                            onChange={(e) => handleInputChange("apellido", e.target.value)}
                            required
                        />
                    </div>
                    {errors.apellido && <p className="text-[9px] text-error px-1">{errors.apellido}</p>}
                </div>
            </div>

            {/* Fila de Identidad */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant px-1">Rol de Acceso</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">admin_panel_settings</span>
                        <select
                            className="w-full bg-surface-container-highest border-none focus:ring-2 focus:ring-primary/50 text-on-surface rounded-xl py-3 pl-12 pr-4 appearance-none transition-all text-sm"
                            value={form.rol}
                            onChange={(e) => handleInputChange("rol", e.target.value)}
                        >
                            <option value="DUENO">Dueño</option>
                            <option value="TRABAJADOR">Empleado</option>
                        </select>
                        <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">expand_more</span>
                    </div>
                </div>

                {isOwner ? (
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant px-1">Nombre del Gimnasio</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">fitness_center</span>
                            <input
                                className={`w-full bg-surface-container-highest border-none focus:ring-2 ${errors.gymNombre ? 'focus:ring-error/50 ring-2 ring-error/30' : 'focus:ring-primary/50'} text-on-surface rounded-xl py-3 pl-12 pr-4 transition-all text-sm placeholder:text-outline/50`}
                                placeholder="Ej. Iron Haven HQ"
                                type="text"
                                value={form.gymNombre}
                                onChange={(e) => handleInputChange("gymNombre", e.target.value)}
                                required
                            />
                        </div>
                        {errors.gymNombre && <p className="text-[9px] text-error px-1">{errors.gymNombre}</p>}
                    </div>
                ) : (
                    <div className="space-y-1">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant px-1">Seleccionar Gimnasio</label>
                        <div className="relative">
                            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">fitness_center</span>
                            {gymsLoading ? (
                                <div className="w-full bg-surface-container-highest border-none text-on-surface/50 rounded-xl py-3 pl-12 pr-4 flex items-center text-sm">
                                    Cargando...
                                </div>
                            ) : (
                                <select
                                    className={`w-full bg-surface-container-highest border-none focus:ring-2 ${errors.gymId ? 'focus:ring-error/50 ring-2 ring-error/30' : 'focus:ring-primary/50'} text-on-surface rounded-xl py-3 pl-12 pr-4 appearance-none transition-all text-sm`}
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
                            {!gymsLoading && <span className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline pointer-events-none text-lg">expand_more</span>}
                        </div>
                        {errors.gymId && <p className="text-[9px] text-error px-1">{errors.gymId}</p>}
                    </div>
                )}
            </div>

            {/* Fila de Contraseña */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant px-1">Contraseña</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">lock</span>
                        <input
                            className={`w-full bg-surface-container-highest border-none focus:ring-2 ${errors.password ? 'focus:ring-error/50 ring-2 ring-error/30' : 'focus:ring-primary/50'} text-on-surface rounded-xl py-3 pl-12 pr-12 transition-all text-sm placeholder:text-outline/50`}
                            placeholder="••••••••"
                            type={showPassword ? "text" : "password"}
                            value={form.password}
                            onChange={(e) => handleInputChange("password", e.target.value)}
                            required
                        />
                        <span
                            onClick={() => setShowPassword(!showPassword)}
                            className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-lg cursor-pointer"
                        >
                            {showPassword ? "visibility_off" : "visibility"}
                        </span>
                    </div>
                    {errors.password && <p className="text-[9px] text-error px-1">{errors.password}</p>}
                </div>

                <div className="space-y-1">
                    <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant px-1">Confirmar</label>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">verified_user</span>
                        <input
                            className={`w-full bg-surface-container-highest border-none focus:ring-2 ${errors.confirmPassword ? 'focus:ring-error/50 ring-2 ring-error/30' : 'focus:ring-primary/50'} text-on-surface rounded-xl py-3 pl-12 pr-12 transition-all text-sm placeholder:text-outline/50`}
                            placeholder="••••••••"
                            type={showConfirmPassword ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
                            required
                        />
                        <span
                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                            className="material-symbols-outlined absolute right-4 top-1/2 -translate-y-1/2 text-outline text-lg cursor-pointer"
                        >
                            {showConfirmPassword ? "visibility_off" : "visibility"}
                        </span>
                    </div>
                    {errors.confirmPassword && <p className="text-[9px] text-error px-1">{errors.confirmPassword}</p>}
                </div>
            </div>

            {/* Dirección Opcional */}
            {isOwner && (
                <div className="space-y-1">
                    <div className="flex justify-between items-center px-1">
                        <label className="block text-[10px] font-bold uppercase tracking-[0.1em] text-on-surface-variant">Dirección del Gimnasio</label>
                        <span className="text-[9px] text-outline italic">Opcional</span>
                    </div>
                    <div className="relative">
                        <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-outline text-lg">location_on</span>
                        <input
                            className="w-full bg-surface-container-highest border-none focus:ring-2 focus:ring-primary/50 text-on-surface rounded-xl py-3 pl-12 pr-4 transition-all text-sm placeholder:text-outline/50"
                            placeholder="Ej. Calle Rendimiento 123"
                            type="text"
                            value={form.gymDireccion}
                            onChange={(e) => handleInputChange("gymDireccion", e.target.value)}
                        />
                    </div>
                </div>
            )}

            {/* CTA */}
            <div className="pt-4 space-y-4">
                <button
                    className="w-full bg-secondary hover:bg-secondary/90 text-on-secondary-container font-bold py-4 rounded-xl shadow-[0px_5px_15px_rgba(78,222,163,0.2)] transition-all flex items-center justify-center gap-3 active:scale-95 group"
                    type="submit"
                    disabled={loading}
                >
                    <span className="uppercase tracking-widest text-xs">
                        {loading ? "Registrando..." : "Registrar Administrador"}
                    </span>
                    <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform text-lg">arrow_forward</span>
                </button>
            </div>
        </form>
    );
};

export default RegisterForm;