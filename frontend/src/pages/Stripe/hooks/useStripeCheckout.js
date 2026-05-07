import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useStripe, useElements, CardElement } from "@stripe/react-stripe-js";
import { confirmOwnerPayment, createBranchAfterPayment, createOwnerSubscriptionPayment, createBranchSubscriptionPayment } from "../../../api/stripe.api";
import api from "../../../api/axios";

/**
 * useStripeCheckout Hook
 * 
 * Manages the complete Stripe payment flow for gym owner registration and branch creation.
 * Handles:
 *   - Payment intent creation (owner subscription or branch subscription)
 *   - Card payment processing with Stripe Elements
 *   - Payment confirmation and backend activation
 * 
 * State Management:
 *   - paymentData: Contains Stripe client secret and user information
 *   - error: Error message to display to user
 *   - processing: Boolean flag for UI loading states
 *   - success: Shown after successful payment
 *   - loadingConfig: Initial setup phase (retrieving payment intent)
 *   - branchForm: Optional branch details (for branch payments)
 * 
 * Two Payment Flows:
 *   1. Owner Registration: /stripe-checkout
 *      - Price: €92/year
 *      - Triggered after user fills registration form
 *   
 *   2. New Branch: /branch-payment
 *      - Price: €45/year per branch
 *      - Triggered when owner adds new location
 * 
 * Data Flow:
 *   1. Component mounts -> initPayment() retrieves client secret from backend
 *   2. User fills card details and submits
 *   3. handleSubmit() confirms payment with Stripe
 *   4. On success, backend endpoint is called (confirmOwnerPayment or createBranchAfterPayment)
 *   5. Success screen shown, redirect after 3 seconds
 * 
 * Error Handling:
 *   - Network errors: Shown with user-friendly messages
 *   - Stripe errors: Validation failures, declined cards, etc
 *   - Missing data: Redirects to registration if no payment context
 */
export const useStripeCheckout = () => {
  // Stripe SDK hooks for card handling
  const stripe = useStripe();
  const elements = useElements();
  
  // Router navigation
  const navigate = useNavigate();
  const location = useLocation();
  
  // Determine payment type based on route
  const isBranchPayment = location.pathname === "/branch-payment";
  
  /**
   * Payment data - contains sensitive Stripe information
   * and user context needed for payment processing
   */
  const [paymentData, setPaymentData] = useState(null);
  
  /**
   * Error messages for user display
   * Set when validation fails or Stripe returns errors
   */
  const [error, setError] = useState(null);
  
  /**
   * Processing flag - true while payment is being sent to Stripe
   * Used to disable form and show loading spinner
   */
  const [processing, setProcessing] = useState(false);
  
  /**
   * Success flag - shown after payment completes
   * Triggers redirect to dashboard after 3 seconds
   */
  const [success, setSuccess] = useState(false);
  
  /**
   * Loading flag - true while retrieving payment intent from backend
   * Shown before form is ready
   */
  const [loadingConfig, setLoadingConfig] = useState(true);
  
  /**
   * Optional branch information for new branch payments
   * Filled by user when adding additional gym location
   */
  const [branchForm, setBranchForm] = useState({
    direccion: '',
    ciudad: '',
    urlWeb: '',
  });

  /**
   * Initialize payment configuration
   * 
   * Runs once on component mount.
   * Retrieves payment intent from backend or sessionStorage.
   */
  useEffect(() => {
    const initPayment = async () => {
      try {
        setLoadingConfig(true);
        let data = null;
        
        if (isBranchPayment) {
          // New branch payment flow
          const stored = sessionStorage.getItem('branchPaymentData');
          if (stored) data = JSON.parse(stored);
          
          if (!data) {
            // No payment context - redirect to admin panel
            navigate('/admins');
            return;
          }

          // Request client secret if not already present
          if (!data.clientSecret) {
            const response = await createBranchSubscriptionPayment({
                ownerId: data.ownerId,
                email: data.email,
                branchName: data.branchData.nombre
            });
            data.clientSecret = response.clientSecret;
          }
        } else {
          // Flujo de registro inicial
          const state = location.state;
          const email = state?.email || sessionStorage.getItem('pendingRegistrationEmail');
          
          if (!email) {
            navigate("/register");
            return;
          }

          let secret = state?.clientSecret;
          
          // Si no tenemos el secret (que es lo que está pasando), lo pedimos
          if (!secret) {
            try {
                const response = await createOwnerSubscriptionPayment({
                    nombre: state?.nombre || "Usuario",
                    apellido: state?.apellido || "FitFlow",
                    email: email,
                    gymNombre: state?.gymNombre || "Mi Gimnasio"
                });
                secret = response.clientSecret;
            } catch (err) {
                console.error("Error al obtener intent de pago:", err);
                setError("No se pudo inicializar la configuración de pago. Intenta de nuevo.");
            }
          }
          
          data = { 
            email, 
            clientSecret: secret, 
            type: 'OWNER',
            ownerData: {
                nombre: state?.nombre,
                apellido: state?.apellido,
                gymNombre: state?.gymNombre
            }
          };
        }
        
        setPaymentData(data);
      } catch (err) {
        console.error("Error inicializando pago:", err);
        setError("Error de conexión con el servidor de pagos.");
      } finally {
        setLoadingConfig(false);
      }
    };

    initPayment();
  }, [isBranchPayment, location.state, navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!stripe || !elements || !paymentData?.clientSecret) {
      setError("Faltan datos de configuración de pago. Recarga la página.");
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      // Obtener elementos del formulario
      const cardElement = elements.getElement(CardElement);
      const nameInput = event.target?.elements?.name || event.target?.name;
      const cardholderName = nameInput?.value?.trim() || "";

      // Validar que se ingresó el nombre
      if (!cardholderName) {
        setError("Por favor ingresa el nombre del titular de la tarjeta");
        setProcessing(false);
        return;
      }

      // Validar que el CardElement tenga datos
      if (!cardElement) {
        setError("Error al procesar la tarjeta. Por favor recarga la página.");
        setProcessing(false);
        return;
      }

      console.log("📋 Confirmando pago con:", {
        clientSecret: paymentData.clientSecret,
        cardholderName,
        email: paymentData.email,
      });

      // Confirmar pago con Stripe usando la nueva API
      const { error: stripeError, paymentIntent } = await stripe.confirmCardPayment(
        paymentData.clientSecret,
        {
          payment_method: {
            card: cardElement,
            billing_details: {
              name: cardholderName,
              email: paymentData.email,
            },
          },
        },
        {
          // Opciones de confirmación
          handleActions: true, // Manejar acciones requeridas como 3D Secure
        }
      );

      if (stripeError) {
        console.error("❌ Error de Stripe:", stripeError);
        setError(`Pago fallido: ${stripeError.message}`);
        setProcessing(false);
        return;
      }

      if (!paymentIntent) {
        console.error("❌ Sin información de payment intent");
        setError("No se recibió confirmación del pago. Por favor contacta con soporte.");
        setProcessing(false);
        return;
      }

      console.log("✅ Payment Intent Status:", paymentIntent.status);

      if (paymentIntent.status === "succeeded") {
        try {
          console.log("💾 Guardando confirmación de pago en backend...");
          
          if (isBranchPayment) {
            await createBranchAfterPayment({
              nombre: paymentData.branchData.nombre,
              direccion: branchForm.direccion,
              ciudad: branchForm.ciudad,
              urlWeb: branchForm.urlWeb,
              paymentIntentId: paymentIntent.id,
            });
            sessionStorage.removeItem('branchPaymentData');
          } else {
            await confirmOwnerPayment({ 
              email: paymentData.email, 
              paymentIntentId: paymentIntent.id 
            });
            sessionStorage.removeItem('pendingRegistrationEmail');
          }
          
          console.log("✅ Pago confirmado exitosamente");
          setSuccess(true);
          setProcessing(false);
          
          setTimeout(() => {
            navigate(isBranchPayment ? "/admins" : "/login", { state: { fromPayment: true } });
          }, 3000);
        } catch (err) {
          console.error("❌ Error post-pago:", err);
          setError("Pago realizado, pero hubo un error al activar el servicio. Contacta con soporte.");
          setProcessing(false);
        }
      } else if (paymentIntent.status === "requires_action") {
        console.log("⚠️ Se requiere acción adicional (3D Secure, etc)");
        setError("Se requiere autenticación adicional. Por favor completa el proceso.");
        setProcessing(false);
      } else {
        console.log("⚠️ Estado inesperado:", paymentIntent.status);
        setError(`Estado inesperado del pago: ${paymentIntent.status}`);
        setProcessing(false);
      }
    } catch (err) {
      console.error("❌ Error general en handleSubmit:", err);
      setError("Ocurrió un error procesando tu pago. Por favor intenta de nuevo.");
      setProcessing(false);
    }
  };

  const handleBranchFormChange = (field, value) => {
    setBranchForm(prev => ({ ...prev, [field]: value }));
  };

  return {
    stripe,
    elements,
    paymentData,
    error,
    processing,
    success,
    loadingConfig,
    branchForm,
    isBranchPayment,
    handleSubmit,
    handleBranchFormChange,
  };
};
