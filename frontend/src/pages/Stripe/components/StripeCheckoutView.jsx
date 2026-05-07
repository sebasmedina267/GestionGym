import React from "react";
import { CardElement } from "@stripe/react-stripe-js";

const StripeCheckoutView = ({ 
  stripe, 
  paymentData, 
  error, 
  processing, 
  success, 
  loadingConfig,
  branchForm, 
  isBranchPayment, 
  handleSubmit, 
  handleBranchFormChange 
}) => {

  if (loadingConfig) {
    return (
      <div className="flex flex-col items-center justify-center space-y-4 animate-pulse">
        <div className="w-16 h-16 border-4 border-primary-midnight/30 border-t-primary-midnight rounded-full animate-spin"></div>
        <p className="text-on-surface-variant-midnight font-bold tracking-widest uppercase text-xs">Configurando entorno seguro...</p>
      </div>
    );
  }

  if (success) {
    return (
      <div className="w-full max-w-md glass-panel rounded-3xl p-10 text-center space-y-6 animate-in fade-in zoom-in duration-500">
        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="material-symbols-outlined text-emerald-400 text-5xl" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
        </div>
        <h2 className="text-3xl font-bold text-white">¡Pago Completado!</h2>
        <p className="text-on-surface-variant-midnight">
          {isBranchPayment 
            ? `La sucursal ${paymentData?.branchData?.nombre} ha sido activada correctamente.`
            : "Tu suscripción ha sido activada correctamente. Ahora puedes empezar a gestionar tu gimnasio."}
        </p>
        <div className="pt-4">
          <div className="flex items-center justify-center gap-3 text-primary-midnight animate-pulse">
            <span className="material-symbols-outlined text-sm">sync</span>
            <span className="text-sm font-semibold tracking-wider uppercase">Redirigiendo...</span>
          </div>
        </div>
      </div>
    );
  }

  const priceLabel = isBranchPayment ? "€45.00" : "€92.00"; 
  const periodLabel = isBranchPayment ? "EUR / AÑO" : "EUR / AÑO";
  const planName = isBranchPayment ? "Nueva Sucursal" : "Plan Pro Anual";

  return (
    <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-12 gap-8">
      {/* Plan Summary Column */}
      <div className="lg:col-span-5 space-y-6">
        <div className="space-y-2">
          <h1 className="text-4xl font-extrabold text-white tracking-tight">Finalizar pago</h1>
          <p className="text-on-surface-variant-midnight text-lg">Confirma los detalles y completa el pago de forma segura.</p>
        </div>
        
        <div className="glass-panel rounded-3xl p-8 space-y-6">
          <div className="flex items-start gap-4">
            <div className="w-14 h-14 rounded-2xl bg-primary-midnight/20 flex items-center justify-center shrink-0 border border-primary-midnight/20">
              <span className="material-symbols-outlined text-primary-midnight text-3xl" style={{ fontVariationSettings: "'FILL' 1" }}>
                {isBranchPayment ? 'add_business' : 'fitness_center'}
              </span>
            </div>
            <div className="grow">
              <p className="text-[11px] font-bold text-primary-midnight uppercase tracking-[0.2em] mb-1">CONCEPTO</p>
              <h3 className="text-2xl font-bold text-white leading-tight">
                {isBranchPayment ? paymentData?.branchData?.nombre : planName}
              </h3>
              <p className="text-on-surface-variant-midnight">{isBranchPayment ? 'Expansión de Gimnasio' : 'FitFlow Gym Management'}</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant-midnight">{isBranchPayment ? 'Activación Sucursal' : 'Suscripción anual'}</span>
              <span className="text-white font-bold">{priceLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant-midnight">Impuestos (IVA)</span>
              <span className="text-white font-bold">€0.00</span>
            </div>
            <div className="flex justify-between items-center pt-4 border-t border-white/10">
              <span className="text-xl font-bold text-white">Total hoy</span>
              <div className="text-right">
                <span className="text-3xl font-black text-white block">{priceLabel}</span>
                <span className="text-[10px] font-bold text-on-surface-variant-midnight uppercase tracking-widest">{periodLabel}</span>
              </div>
            </div>
          </div>
          
          <div className="bg-primary-midnight/5 rounded-2xl p-4 border border-primary-midnight/10 flex gap-3">
            <span className="material-symbols-outlined text-primary-midnight">info</span>
            <p className="text-xs text-on-surface-variant-midnight leading-relaxed">
              {isBranchPayment 
                ? 'El pago de sucursal es anual. Se renovará automáticamente cada año.'
                : 'Tu suscripción se renovará automáticamente cada año. Puedes cancelarla en cualquier momento.'}
            </p>
          </div>
        </div>
      </div>

      {/* Payment Form Column */}
      <div className="lg:col-span-7">
        <div className="glass-panel rounded-3xl p-8 lg:p-10 space-y-8">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Detalles del Pago</h2>
            <div className="flex gap-2">
               <div className="w-10 h-6 bg-white/5 rounded border border-white/10 flex items-center justify-center grayscale opacity-50 text-white">
                  <span className="material-symbols-outlined text-[10px]">credit_card</span>
               </div>
               <div className="w-10 h-6 bg-white/5 rounded border border-white/10 flex items-center justify-center grayscale opacity-50 text-white">
                  <span className="material-symbols-outlined text-[10px]">verified</span>
               </div>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            {isBranchPayment && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant-midnight ml-1">Dirección (Opcional)</label>
                  <input 
                    className="w-full h-12 bg-white text-[#0e1321] rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary-midnight/20 outline-none transition-all border-2 border-transparent" 
                    placeholder="Calle..." 
                    type="text"
                    value={branchForm.direccion}
                    onChange={(e) => handleBranchFormChange('direccion', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant-midnight ml-1">Ciudad (Opcional)</label>
                  <input 
                    className="w-full h-12 bg-white text-[#0e1321] rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary-midnight/20 outline-none transition-all border-2 border-transparent" 
                    placeholder="Ciudad..." 
                    type="text"
                    value={branchForm.ciudad}
                    onChange={(e) => handleBranchFormChange('ciudad', e.target.value)}
                  />
                </div>
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant-midnight ml-1">Nombre en la tarjeta</label>
              <input 
                name="name"
                className="w-full h-14 bg-white text-[#0e1321] rounded-2xl px-5 font-medium focus:ring-4 focus:ring-primary-midnight/20 focus:border-primary-midnight outline-none transition-all placeholder:text-gray-400 border-2 border-transparent" 
                placeholder="John Doe" 
                type="text"
                required
              />
            </div>

            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant-midnight ml-1">Información de la tarjeta</label>
              <div className="w-full h-14 bg-white rounded-2xl px-5 flex items-center border-2 border-transparent transition-all">
                <div className="w-full">
                  <CardElement options={{
                    style: {
                      base: {
                        fontSize: '16px',
                        color: '#0e1321',
                        '::placeholder': {
                          color: '#9ca3af',
                        },
                      },
                      invalid: {
                        color: '#ef4444',
                      },
                    },
                  }} />
                </div>
              </div>
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-400 animate-in slide-in-from-top-2">
                <span className="material-symbols-outlined text-sm">error</span>
                <p className="text-xs font-medium">{error}</p>
              </div>
            )}

            <button 
              className={`w-full h-16 vibrant-gradient text-white font-bold text-xl rounded-2xl shadow-2xl shadow-primary-midnight/30 active:scale-[0.98] transition-all flex items-center justify-center gap-3 mt-6 ${processing || !stripe ? 'opacity-80 cursor-wait' : ''}`}
              type="submit"
              disabled={processing || !stripe}
            >
              {processing ? (
                <>
                  <div className="w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Procesando...</span>
                </>
              ) : (
                <>
                  Pagar y Confirmar
                  <span className="material-symbols-outlined">arrow_forward</span>
                </>
              )}
            </button>

            <p className="text-center text-[10px] text-on-surface-variant-midnight px-4 leading-relaxed uppercase tracking-tighter opacity-70">
              Pagos encriptados por SSL de 256 bits. Al confirmar, aceptas nuestros <a className="text-primary-midnight hover:underline" href="#">Términos</a> y <a className="text-primary-midnight hover:underline" href="#">Privacidad</a>.
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default StripeCheckoutView;
