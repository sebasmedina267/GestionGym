import React, { useCallback, useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNotification } from "../../hooks/useNotification";
import api from "../../api/axios";
import { Link, useNavigate } from "react-router-dom";
import "./ClientProfile.css";

export default function ClientProfile() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const { success, error: notifyError } = useNotification();
  
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [historyError, setHistoryError] = useState("");
  const [transactionStats, setTransactionStats] = useState(null);
  
  const [formData, setFormData] = useState({
    nombre: "",
    apellido: "",
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get("/client/dashboard/profile");
      const data = response.data.data;
      setProfile(data);
      setFormData({
        nombre: data.nombre || "",
        apellido: data.apellido || "",
      });
    } catch (err) {
      console.error("Error fetching profile:", err);
      notifyError("No pudimos cargar tu perfil");
    } finally {
      setLoading(false);
    }
  }, [notifyError]);

  const fetchTransactions = useCallback(async () => {
    try {
      setHistoryLoading(true);
      setHistoryError("");
      const [historyResponse, statsResponse] = await Promise.all([
        api.get("/client/dashboard/transactions", { params: { limit: 50 } }),
        api.get("/client/dashboard/transactions/stats"),
      ]);
      setTransactions(historyResponse.data.data || []);
      setTransactionStats(statsResponse.data.data || null);
    } catch (err) {
      console.error("Error fetching transaction history:", err);
      setHistoryError("No pudimos cargar tu historial de pagos.");
    } finally {
      setHistoryLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchProfile();
    fetchTransactions();
  }, [fetchProfile, fetchTransactions]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      await api.patch("/client/dashboard/profile", formData);
      success("Perfil actualizado con éxito");
      await fetchProfile();
    } catch (err) {
      console.error("Error updating profile:", err);
      notifyError("Error al actualizar el perfil");
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const formatDate = (date) => {
    if (!date) return "Fecha no disponible";
    const parsedDate = new Date(date);
    if (Number.isNaN(parsedDate.getTime())) return "Fecha no disponible";
    return new Intl.DateTimeFormat("es-ES", { dateStyle: "medium" }).format(parsedDate);
  };

  const formatAmount = (amount) =>
    new Intl.NumberFormat("es-ES", { style: "currency", currency: "EUR" }).format(
      Number(amount) || 0
    );

  if (loading) {
    return (
      <div className="client-profile-loading">
        <div className="spinner"></div>
        <p>Cargando perfil...</p>
      </div>
    );
  }

  return (
    <div className="client-profile-container">
      {/* Header */}
      <header className="client-profile-header">
        <div className="client-profile-header__top">
          <Link to="/client/dashboard" className="client-profile-back-link">
            &larr; Volver al Dashboard
          </Link>
          <div className="client-profile-logo">
            <span className="client-profile-logo__text">Mi Perfil</span>
          </div>
          <button onClick={handleLogout} className="client-profile-logout-btn">
            Cerrar Sesión
          </button>
        </div>
      </header>

      <main className="client-profile-main">
        <section className="client-profile-section">
          <h2>Datos Personales</h2>
          <form onSubmit={handleSubmit} className="client-profile-form">
            <div className="form-group">
              <label>Nombre</label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleInputChange}
                required
                className="profile-input"
              />
            </div>
            
            <div className="form-group">
              <label>Apellido</label>
              <input
                type="text"
                name="apellido"
                value={formData.apellido}
                onChange={handleInputChange}
                required
                className="profile-input"
              />
            </div>

            <div className="form-group">
              <label>Email</label>
              <input
                type="email"
                value={profile?.email || ""}
                disabled
                className="profile-input disabled-input"
              />
              <small className="input-hint">El email no se puede modificar.</small>
            </div>

            <div className="form-group">
              <label>Suscripción</label>
              <input
                type="text"
                value={profile?.tipo_suscripcion || "N/A"}
                disabled
                className="profile-input disabled-input"
              />
            </div>

            <div className="form-actions">
              <button type="submit" disabled={saving} className="btn-primary-large">
                {saving ? "Guardando..." : "Guardar Cambios"}
              </button>
            </div>
          </form>
        </section>

        <section className="client-profile-section mt-8">
          <div className="history-heading">
            <h2>Historial de pagos</h2>
            {transactionStats && (
              <p className="history-total">
                Total pagado: {formatAmount(transactionStats.total_gastado)}
              </p>
            )}
          </div>
          {historyLoading ? (
            <p className="history-message" role="status">Cargando historial...</p>
          ) : historyError ? (
            <div className="history-error" role="alert">
              <p>{historyError}</p>
              <button type="button" onClick={fetchTransactions} className="history-retry">
                Reintentar
              </button>
            </div>
          ) : transactions.length === 0 ? (
            <p className="history-message">Todavía no tienes pagos registrados.</p>
          ) : (
            <div className="transaction-list">
              {transactions.map((transaction) => (
                <article className="transaction-card" key={transaction.id}>
                  <div className="transaction-card__main">
                    <div>
                      <h3>{transaction.tipo_transaccion || "Pago"}</h3>
                      <p>
                        {transaction.gym_nombre || "Gimnasio"} ·{" "}
                        {transaction.metodo_pago || "Método no disponible"}
                      </p>
                    </div>
                    <strong>{formatAmount(transaction.importe)}</strong>
                  </div>
                  <div className="transaction-card__details">
                    <span>{formatDate(transaction.fecha_pago)}</span>
                    <span className={transaction.pagado ? "payment-status paid" : "payment-status pending"}>
                      {transaction.pagado ? "Pagado" : "Pendiente"}
                    </span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
