import React from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements } from "@stripe/react-stripe-js";
import StripeCheckoutView from "./components/StripeCheckoutView";
import { useStripeCheckout } from "./hooks/useStripeCheckout";
import "./Styles/StripeCheckout.css";

/**
 * Stripe SDK Initialization
 * Loads the Stripe.js script asynchronously using the publishable key from environment variables.
 */
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY || "pk_test_placeholder");

/**
 * CheckoutContainer Component
 * 
 * Functional wrapper that connects the Stripe Checkout logic with its visual view.
 * Leverages the useStripeCheckout hook to manage payment intent synchronization and form state.
 */
const CheckoutContainer = () => {
  const checkoutProps = useStripeCheckout();
  return <StripeCheckoutView {...checkoutProps} />;
};

/**
 * StripeCheckoutPage Component
 * 
 * The authoritative financial gateway for account activation and subscription expansion.
 * Responsibilities:
 * - Providing a secure, high-fidelity environment for payment processing.
 * - Wrapping the checkout flow with Stripe's 'Elements' provider for PCI compliance.
 * - Enforcing a premium 'Kinetic' UI for the transaction experience.
 * - Visualizing security trust signals (SSL, Verified Payment).
 */
export default function StripeCheckoutPage() {
  return (
    <div className="min-h-screen bg-surface-midnight text-on-surface-midnight antialiased font-manrope flex flex-col">
      {/* Top Navigation Bar: Displays brand identity and security badges */}
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

      {/* Main Payment Portal: Centers the Stripe Elements credit card form */}
      <main className="flex-grow pt-24 pb-12 px-6 flex items-center justify-center">
        <Elements stripe={stripePromise}>
          <CheckoutContainer />
        </Elements>
      </main>

      {/* Footer: Legal and technology compliance badges */}
      <footer className="py-8 px-6 border-t border-white/5 text-center">
        <p className="text-xs text-on-surface-variant-midnight uppercase tracking-widest opacity-50">
          Powered by Stripe & FitFlow Security
        </p>
      </footer>
    </div>
  );
}
