import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import api from "../../api/axios";
import "./ClientEnroll.css";

/**
 * ClientEnroll Component
 * 
 * Enrollment page for users to join a gym with payment.
 * Displays gym information, pricing options, and Stripe checkout.
 */
export default function ClientEnroll() {
  const { logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  
  const { gymId } = location.state || {};
  
  const [gym, setGym] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [enrolling, setEnrolling] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState("monthly");

  useEffect(() => {
    if (!gymId) {
      navigate("/client/dashboard");
      return;
    }
    
    fetchGymDetails();
  }, [gymId, navigate]);

  const fetchGymDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/client/gyms/${gymId}/details`);
      setGym(response.data?.data);
    } catch (err) {
      console.error("Error fetching gym details:", err);
      setError("No pudimos cargar los detalles del gimnasio");
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = async () => {
    try {
      setEnrolling(true);
      setError(null);

      // Create payment intent
      const paymentResponse = await api.post("/stripe/create-payment-intent", {
        gymId,
        type: "MEMBERSHIP",
        plan: selectedPlan,
        amount: gym.precio_cuota_mensual,
        description: `Membresía ${selectedPlan} - ${gym.nombre}`,
      });

      const { clientSecret } = paymentResponse.data.data;

      // Redirect to Stripe checkout
      // You can either use Stripe's redirect or embed a Stripe form
      // For now, we'll redirect to the Stripe checkout page
      window.location.href = `/stripe-checkout?clientSecret=${clientSecret}&gymId=${gymId}`;
    } catch (err) {
      console.error("Error initiating enrollment:", err);
      setError(
        err.response?.data?.message || "Error al procesar la inscripción"
      );
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) {
    return (
      <div className="enroll-container loading-state">
        <div className="spinner"></div>
        <p>Cargando información del gimnasio...</p>
      </div>
    );
  }

  if (error && !gym) {
    return (
      <div className="enroll-container">
        <div className="enroll-error">
          <p>{error}</p>
          <button onClick={() => navigate("/client/dashboard")} className="btn-secondary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  if (!gym) {
    return (
      <div className="enroll-container">
        <div className="enroll-error">
          <p>No se pudo cargar la información del gimnasio</p>
          <button onClick={() => navigate("/client/dashboard")} className="btn-secondary">
            Volver
          </button>
        </div>
      </div>
    );
  }

  const plans = [
    {
      id: "monthly",
      name: "Plan Mensual",
      price: gym.precio_cuota_mensual,
      duration: "1 mes",
      description: "Acceso ilimitado durante 30 días",
      features: [
        "Acceso 24/7 al gimnasio",
        "Todas las máquinas disponibles",
        "Acceso a todas las clases",
        "Soporte técnico",
      ],
    },
    {
      id: "quarterly",
      name: "Plan Trimestral",
      price: (gym.precio_cuota_mensual * 3 * 0.9).toFixed(2), // 10% discount
      duration: "3 meses",
      description: "Acceso ilimitado durante 90 días (Ahorra 10%)",
      features: [
        "Acceso 24/7 al gimnasio",
        "Todas las máquinas disponibles",
        "Acceso a todas las clases",
        "Soporte técnico",
        "Descuento aplicado",
      ],
    },
    {
      id: "annual",
      name: "Plan Anual",
      price: (gym.precio_cuota_mensual * 12 * 0.8).toFixed(2), // 20% discount
      duration: "12 meses",
      description: "Acceso ilimitado durante 365 días (Ahorra 20%)",
      features: [
        "Acceso 24/7 al gimnasio",
        "Todas las máquinas disponibles",
        "Acceso a todas las clases",
        "Soporte técnico",
        "Descuento aplicado",
      ],
    },
  ];

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  return (
    <div className="enroll-container">
      <header className="enroll-header">
        <div className="enroll-header__top">
          <div className="enroll-logo">
            <svg className="h-8 w-8" fill="currentColor" viewBox="0 0 24 24">
              <path d="M20.57 14.86L22 13.43L20.57 12L17 15.57L8.43 7L12 3.43L10.57 2L9.14 3.43L7.71 2L5.57 4.14L4.14 2.71L2.71 4.14L4.86 6.29L2.71 8.43L4.14 9.86L5.57 8.43L7 9.86L3.43 13.43L4.86 14.86L6.29 13.43L14.86 22L11.43 18.57L10 20L11.43 21.43L10 22.86L12.14 25l2.14-2.14 1.43 1.43 1.43-1.43-2.14-2.14 2.14-2.14-1.43-1.43-1.43 1.43-3.57-3.57 8.57-8.57z"></path>
            </svg>
            <span>FitFlow</span>
          </div>
          <button onClick={logout} className="btn-logout">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="enroll-main">
        <div className="enroll-content">
          {/* Left: Gym Info */}
          <section className="enroll-gym-info">
            <div className="gym-info-card">
              {gym.foto && (
                <img src={`/uploads/${gym.foto}`} alt={gym.nombre} className="gym-info-image" />
              )}
              <div className="gym-info-body">
                <h1>{gym.nombre}</h1>
                <div className="gym-info-details">
                  <p className="detail">
                    <strong>📍 Ubicación:</strong> {gym.direccion}, {gym.ciudad}
                  </p>
                  <p className="detail">
                    <strong>⏰ Horario:</strong> {gym.horario_inicio} - {gym.horario_fin}
                  </p>
                  {gym.telefono && (
                    <p className="detail">
                      <strong>📞 Teléfono:</strong>{" "}
                      <a href={`tel:${gym.telefono}`}>{gym.telefono}</a>
                    </p>
                  )}
                  <p className="detail">
                    <strong>👥 Miembros Activos:</strong> {gym.miembros_activos || 0}
                  </p>
                </div>

                {/* Quick Stats */}
                <div className="gym-stats">
                  <div className="stat">
                    <div className="stat-icon">🏋️</div>
                    <div className="stat-content">
                      <p className="stat-value">{gym.total_clases || 0}</p>
                      <p className="stat-label">Clases</p>
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-icon">💪</div>
                    <div className="stat-content">
                      <p className="stat-value">{gym.total_maquinas || 0}</p>
                      <p className="stat-label">Máquinas</p>
                    </div>
                  </div>
                  <div className="stat">
                    <div className="stat-icon">🛍️</div>
                    <div className="stat-content">
                      <p className="stat-value">{gym.total_productos || 0}</p>
                      <p className="stat-label">Productos</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Right: Plans and Checkout */}
          <section className="enroll-checkout">
            <h2>Elige tu Plan de Membresía</h2>

            {error && (
              <div className="enroll-error-alert">
                <p>{error}</p>
              </div>
            )}

            {/* Plans Grid */}
            <div className="plans-grid">
              {plans.map((plan) => (
                <div
                  key={plan.id}
                  className={`plan-card ${selectedPlan === plan.id ? "selected" : ""}`}
                  onClick={() => setSelectedPlan(plan.id)}
                >
                  {plan.id === "annual" && (
                    <div className="plan-badge">Mejor Oferta</div>
                  )}
                  {plan.id === "quarterly" && (
                    <div className="plan-badge">Recomendado</div>
                  )}

                  <h3>{plan.name}</h3>
                  <p className="plan-duration">{plan.duration}</p>
                  <div className="plan-price">
                    <span className="currency">$</span>
                    <span className="amount">{plan.price}</span>
                  </div>
                  <p className="plan-description">{plan.description}</p>

                  <ul className="plan-features">
                    {plan.features.map((feature, idx) => (
                      <li key={idx}>
                        <span className="feature-icon">✓</span>
                        {feature}
                      </li>
                    ))}
                  </ul>

                  <button
                    className={`plan-select-btn ${selectedPlan === plan.id ? "active" : ""}`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {selectedPlan === plan.id ? "✓ Seleccionado" : "Seleccionar"}
                  </button>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="enroll-summary">
              <h3>Resumen de tu Inscripción</h3>
              <div className="summary-item">
                <span>Gimnasio:</span>
                <strong>{gym.nombre}</strong>
              </div>
              <div className="summary-item">
                <span>Plan:</span>
                <strong>{selectedPlanData.name}</strong>
              </div>
              <div className="summary-item">
                <span>Duración:</span>
                <strong>{selectedPlanData.duration}</strong>
              </div>
              <div className="summary-total">
                <span>Total:</span>
                <strong>${selectedPlanData.price}</strong>
              </div>

              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="btn-enroll"
              >
                {enrolling ? "Procesando..." : `💳 Pagar y Enrolarse`}
              </button>

              <p className="payment-info">
                Serás redirigido a Stripe para completar tu pago de forma segura
              </p>
            </div>
          </section>
        </div>
      </main>
    </div>
  );
}
