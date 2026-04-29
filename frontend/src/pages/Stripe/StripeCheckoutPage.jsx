import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import api from "../../api/axios";
import { confirmOwnerPayment, createBranchAfterPayment } from "../../api/stripe.api";
import "./Styles/StripeCheckout.css";

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const navigate = useNavigate();
  const location = useLocation();
  
  // Detectar tipo de pago (Registro Inicial o Nueva Sucursal)
  const isBranchPayment = location.pathname === "/branch-payment";
  
  // Obtener datos del pago
  const [paymentData, setPaymentData] = useState(null);
  const [error, setError] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [success, setSuccess] = useState(false);
  const [branchForm, setBranchForm] = useState({
    direccion: '',
    ciudad: '',
    urlWeb: '',
  });

  useEffect(() => {
    let data = null;
    if (isBranchPayment) {
      const stored = sessionStorage.getItem('branchPaymentData');
      if (stored) data = JSON.parse(stored);
      if (!data) navigate('/admins');
    } else {
      // Flujo de registro inicial
      const email = location.state?.email || sessionStorage.getItem('pendingRegistrationEmail');
      if (!email) {
        navigate("/register");
        return;
      }
      // Para el registro inicial, el clientSecret se genera aquí o viene del estado
      // Asumimos que viene del estado o se genera en el backend
      const secret = location.state?.clientSecret;
      data = { email, clientSecret: secret, type: 'OWNER' };
    }
    setPaymentData(data);
  }, [isBranchPayment, location.state, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentData?.clientSecret) {
      setError("Faltan datos de configuración de pago.");
      return;
    }

    setProcessing(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);

    const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(paymentData.clientSecret, {
      payment_method: {
        card: cardElement,
        billing_details: {
          name: event.target.name.value,
          email: paymentData.email,
        },
      },
    });

    if (stripeError) {
      setError(`Pago fallido: ${stripeError.message}`);
      setProcessing(false);
    } else if (paymentIntent.status === "succeeded") {
      try {
        if (isBranchPayment) {
          // ACTIVAR SUCURSAL
          await createBranchAfterPayment({
            nombre: paymentData.branchData.nombre,
            direccion: branchForm.direccion,
            ciudad: branchForm.ciudad,
            urlWeb: branchForm.urlWeb,
            paymentIntentId: paymentIntent.id,
          });
          sessionStorage.removeItem('branchPaymentData');
        } else {
          // ACTIVAR DUEÑO
          await confirmOwnerPayment({ 
            email: paymentData.email, 
            paymentIntentId: paymentIntent.id 
          });
          sessionStorage.removeItem('pendingRegistrationEmail');
        }
        
        setSuccess(true);
        setProcessing(false);
        
        setTimeout(() => {
          navigate(isBranchPayment ? "/admins" : "/login", { state: { fromPayment: true } });
        }, 3000);
      } catch (err) {
        console.error("Error post-pago:", err);
        setError("Pago realizado, pero hubo un error al activar el servicio. Contacta con soporte.");
        setProcessing(false);
      }
    }
  };

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

  const priceLabel = isBranchPayment ? "$49.00" : "$49.99";
  const periodLabel = isBranchPayment ? "USD / AÑO" : "USD / MES";
  const planName = isBranchPayment ? "Nueva Sucursal" : "Plan Pro";

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
            <div className="flex-grow">
              <p className="text-[11px] font-bold text-primary-midnight uppercase tracking-[0.2em] mb-1">CONCEPTO</p>
              <h3 className="text-2xl font-bold text-white leading-tight">
                {isBranchPayment ? paymentData?.branchData?.nombre : planName}
              </h3>
              <p className="text-on-surface-variant-midnight">{isBranchPayment ? 'Expansión de Gimnasio' : 'FitFlow Gym Management'}</p>
            </div>
          </div>
          
          <div className="pt-6 border-t border-white/5 space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant-midnight">{isBranchPayment ? 'Activación Sucursal' : 'Suscripción mensual'}</span>
              <span className="text-white font-bold">{priceLabel}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-on-surface-variant-midnight">Impuestos (IVA)</span>
              <span className="text-white font-bold">$0.00</span>
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
                : 'Tu suscripción se renovará automáticamente cada mes. Puedes cancelarla en cualquier momento.'}
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
                    onChange={(e) => setBranchForm({...branchForm, direccion: e.target.value})}
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold uppercase tracking-widest text-on-surface-variant-midnight ml-1">Ciudad (Opcional)</label>
                  <input 
                    className="w-full h-12 bg-white text-[#0e1321] rounded-xl px-4 text-sm focus:ring-4 focus:ring-primary-midnight/20 outline-none transition-all border-2 border-transparent" 
                    placeholder="Ciudad..." 
                    type="text"
                    value={branchForm.ciudad}
                    onChange={(e) => setBranchForm({...branchForm, ciudad: e.target.value})}
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
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl flex gap-3 text-red-400">
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

export default function StripeCheckoutPage() {
  return (
    <div className="min-h-screen bg-surface-midnight text-on-surface-midnight antialiased font-manrope flex flex-col">
      {/* Top Navigation */}
      <nav className="fixed top-0 w-full z-50 border-b border-white/10 bg-[#1a1f2e]/80 backdrop-blur-md shadow-xl shadow-black/20">
        <div className="flex justify-between items-center px-6 h-16 max-w-7xl mx-auto">
          <div className="text-2xl font-black tracking-tighter text-white">FitFlow</div>
          <div className="flex items-center gap-4">
             <div className="flex items-center gap-2 bg-emerald-500/10 text-emerald-400 px-3 py-1 rounded-full border border-emerald-500/20">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>verified_user</span>
              <span className="text-[10px] font-bold uppercase tracking-widest">Pago Seguro</span>
            </div>
          </div>
        </div>
      </nav>

      <main className="flex-grow pt-24 pb-12 px-6 flex items-center justify-center">
        <Elements stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      </main>

      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-xs text-on-surface-variant-midnight uppercase tracking-widest opacity-50">
          Powered by Stripe & FitFlow Security
        </p>
      </footer>
    </div>
  );
}
