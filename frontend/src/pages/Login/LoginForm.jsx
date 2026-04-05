import React from "react";
import { Link } from "react-router-dom";

const LoginForm = ({ form, loading, error, handleInputChange, handleSubmit }) => {
  const [showPassword, setShowPassword] = React.useState(false);

  return (
    <form className="space-y-6" onSubmit={handleSubmit}>
      {/* Error Message */}
      {error && (
        <div className="p-3 bg-error-container/20 text-error rounded-xl text-xs font-medium border border-error/20 animate-pulse">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-sm">error</span>
            {error}
          </div>
        </div>
      )}

      {/* Field: Nombre */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.05em] ml-1">
          Nombre
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">person</span>
          </div>
          <input
            className="w-full bg-surface-container-highest border-none focus:ring-2 focus:ring-primary/50 text-on-surface rounded-xl py-4 pl-12 pr-4 placeholder:text-on-surface-variant/40 transition-all text-sm"
            placeholder="Tu nombre"
            type="text"
            value={form.nombre}
            onChange={(e) => handleInputChange("nombre", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Field: Apellido */}
      <div className="space-y-2">
        <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.05em] ml-1">
          Apellido
        </label>
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">badge</span>
          </div>
          <input
            className="w-full bg-surface-container-highest border-none focus:ring-2 focus:ring-primary/50 text-on-surface rounded-xl py-4 pl-12 pr-4 placeholder:text-on-surface-variant/40 transition-all text-sm"
            placeholder="Tu apellido"
            type="text"
            value={form.apellido}
            onChange={(e) => handleInputChange("apellido", e.target.value)}
            required
          />
        </div>
      </div>

      {/* Field: Contraseña */}
      <div className="space-y-2">
        <div className="flex justify-between items-center px-1">
          <label className="block text-[10px] font-bold text-on-surface-variant uppercase tracking-[0.05em]">
            Contraseña
          </label>
          <a
            className="text-[10px] font-bold text-primary/70 hover:text-primary transition-colors uppercase tracking-[0.05em]"
            href="#"
          >
            ¿Olvidaste la clave?
          </a>
        </div>

        <div className="relative group">
          {/* Icono izquierdo */}
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant group-focus-within:text-primary transition-colors">
            <span className="material-symbols-outlined text-xl">lock</span>
          </div>

          {/* Input */}
          <input
            className="w-full bg-surface-container-highest border-none focus:ring-2 focus:ring-primary/50 text-on-surface rounded-xl py-4 pl-12 pr-12 placeholder:text-on-surface-variant/40 transition-all text-sm"
            placeholder="••••••••"
            type={showPassword ? "text" : "password"}
            value={form.password}
            onChange={(e) => handleInputChange("password", e.target.value)}
            required
          />

          {/* Botón ojito */}
          <button
            type="button"
            onClick={() => setShowPassword((prev) => !prev)}
            className="absolute inset-y-0 right-0 pr-4 flex items-center text-on-surface-variant hover:text-primary transition-colors"
          >
            <span className="material-symbols-outlined text-xl">
              {showPassword ? "visibility_off" : "visibility"}
            </span>
          </button>
        </div>
      </div>

      {/* Primary Action */}
      <div className="pt-4">
        <button
          className="w-full bg-secondary text-on-secondary font-black py-4 rounded-xl shadow-[0px_10px_20px_rgba(78,222,163,0.3)] hover:shadow-[0px_15px_30px_rgba(78,222,163,0.5)] active:scale-[0.98] transition-all flex items-center justify-center gap-2 group disabled:opacity-50 disabled:pointer-events-none"
          type="submit"
          disabled={loading}
        >
          <span className="uppercase tracking-widest text-sm">
            {loading ? "Iniciando..." : "Entrar"}
          </span>

          {!loading && (
            <span className="material-symbols-outlined group-hover:translate-x-1 transition-transform">
              arrow_forward
            </span>
          )}
        </button>
      </div>

      {/* Secondary Link */}
      <footer className="mt-4 text-center">
        <p className="text-on-surface-variant text-xs font-label tracking-wide">
          ¿No tienes cuenta?
          <Link
            to="/register"
            className="text-secondary font-bold hover:text-secondary/80 transition-all ml-1 glow-hover"
          >
            Crear una cuenta
          </Link>
        </p>
      </footer>
    </form>
  );
};

export default LoginForm;
