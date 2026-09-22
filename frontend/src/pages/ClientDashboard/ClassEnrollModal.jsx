import React, { useState } from "react";

/**
 * ClassEnrollModal
 *
 * A premium confirmation modal for class enrollment and unenrollment.
 * Uses custom glassmorphic styling, backdrop-blur, micro-animations, and clean loading states.
 */
export default function ClassEnrollModal({
  isOpen,
  onClose,
  clase,
  actionType, // 'enroll' | 'unenroll'
  onConfirm
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !clase) return null;

  const isEnroll = actionType === "enroll";

  const handleConfirm = async () => {
    try {
      setLoading(true);
      setError("");
      await onConfirm(clase.horarioId || clase.id);
      onClose();
    } catch (err) {
      console.error(err);
      setError(
        err.response?.data?.message ||
        `Error al ${isEnroll ? "inscribirse en" : "desapuntarse de"} la clase. Intente nuevamente.`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-[#020205]/80 backdrop-blur-md transition-opacity duration-300"
        onClick={!loading ? onClose : undefined}
      ></div>

      {/* Modal Container */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-[#1f2937] bg-[#111422]/90 p-6 shadow-2xl backdrop-blur-xl transition-all duration-300 scale-100 hover:border-gym-accent/40">
        {/* Glow effect */}
        <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full blur-3xl opacity-20 ${
          isEnroll ? "bg-indigo-500" : "bg-red-500"
        }`}></div>

        {/* Header */}
        <div className="flex items-center space-x-3 mb-4">
          <div className={`p-3 rounded-xl ${
            isEnroll ? "bg-indigo-500/10 text-indigo-400" : "bg-red-500/10 text-red-400"
          }`}>
            {isEnroll ? (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"></path>
              </svg>
            ) : (
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7a4 4 0 11-8 0 4 4 0 018 0zM9 20a6 6 0 0112 0v1H9v-1zM21 12a9 9 0 11-18 0 9 9 0 0118 0zM9 10a1 1 0 011-1h4a1 1 0 110 2H10a1 1 0 01-1-1z"></path>
              </svg>
            )}
          </div>
          <div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              {isEnroll ? "Confirmar Inscripción" : "Cancelar Inscripción"}
            </h3>
            <p className="text-xs text-gray-400">Paso de verificación final</p>
          </div>
        </div>

        {/* Class Details Body */}
        <div className="my-5 rounded-xl bg-[#0a0b14]/60 p-4 border border-[#1f2937]/50 space-y-3">
          <div>
            <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Clase / Actividad</span>
            <p className="text-base font-black text-white">{clase.nombre}</p>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-[#1f2937]/30">
            <div>
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Horario</span>
              <p className="text-xs text-gray-300 font-medium mt-0.5">
                {clase.inicio || "Horario pendiente"}
              </p>
            </div>
            <div>
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Monitor/a</span>
              <p className="text-xs text-gray-300 font-medium mt-0.5">
                {clase.monitor || "Por asignar"}
              </p>
            </div>
          </div>

          {clase.aforo_maximo && (
            <div className="pt-2 border-t border-[#1f2937]/30">
              <span className="text-[9px] uppercase tracking-wider text-gray-500 font-bold">Aforo Máximo</span>
              <p className="text-xs text-gym-accent font-bold mt-0.5">{clase.aforo_maximo} personas</p>
            </div>
          )}
        </div>

        {/* Error notification */}
        {error && (
          <div className="mb-4 rounded-lg bg-red-950/20 border border-red-500/30 p-3 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex space-x-3 mt-6">
          <button
            type="button"
            className="flex-1 px-4 py-2.5 rounded-xl border border-[#1f2937] hover:bg-[#1f2937]/50 transition-colors text-sm font-medium text-gray-300 disabled:opacity-40"
            disabled={loading}
            onClick={onClose}
          >
            Cancelar
          </button>
          <button
            type="button"
            className={`flex-1 px-4 py-2.5 rounded-xl text-sm font-bold text-white transition-all shadow-lg ${
              isEnroll
                ? "bg-indigo-600 hover:bg-indigo-500 hover:shadow-indigo-500/20"
                : "bg-red-600 hover:bg-red-500 hover:shadow-red-500/20"
            } disabled:opacity-50`}
            disabled={loading}
            onClick={handleConfirm}
          >
            {loading ? (
              <span className="flex items-center justify-center space-x-2">
                <span className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent"></span>
                <span>Procesando...</span>
              </span>
            ) : (
              <span>{isEnroll ? "Confirmar" : "Desapuntarme"}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
