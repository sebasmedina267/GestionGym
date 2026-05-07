import Button from "../../components/ui/Button";
import { useNavigate } from "react-router-dom";
import "./Styles/SelectGymPage.css";
import { useAuth } from "../../hooks/useAuth";
import { useGym } from "../../hooks/useGym";
import { useFetch } from "../../hooks/useFetch";

/**
 * SelectGymPage Component
 * 
 * Serves as the organizational entry point for multi-branch administrators.
 * Features:
 * - Real-time synchronization of managed branches for the authenticated user.
 * - Persistent context selection via the useGym hook.
 * - High-fidelity Kinetic UI cards with atmospheric background effects.
 * - Guarded navigation ensuring a branch is selected before dashboard access.
 */
export default function SelectGymPage() {
  const { admin } = useAuth();
  const { setGym } = useGym();
  const navigate = useNavigate();

  // Retrieves the portfolio of branches managed by the authenticated administrator
  const { data: gyms, loading } = useFetch(admin ? `/gyms` : null);

  /** Auth Guard: Ensures user context exists before rendering the selector */
  if (!admin) return (
    <div className="select-gym-container">
      <div className="loading-gyms-container">
        <div className="loading-gyms-spinner"></div>
        <p>Cargando usuario...</p>
      </div>
    </div>
  );

  /**
   * Persists the selected branch context and navigates to the primary dashboard.
   * @param {Object} gym - The selected branch entity.
   */
  const handleSelect = (gym) => {
    setGym(gym);  
    navigate("/");
  };

  /** Loading Guard: Visual feedback during branch portfolio retrieval */
  if (loading) return (
    <div className="select-gym-container">
      <div className="loading-gyms-container">
        <div className="loading-gyms-spinner"></div>
        <p>Cargando gimnasios...</p>
      </div>
    </div>
  );

  return (
    <div className="select-gym-container">
      {/* Ambient Effects: Enhance the visual depth and premium feel of the selection screen */}
      <div className="select-gym-ambient-1"></div>
      <div className="select-gym-ambient-2"></div>

      <header className="select-gym-header">
        <h1 className="select-gym-title">Seleccionar Centro</h1>
        <p className="select-gym-subtitle">Elige la unidad operativa para gestionar tu ecosistema.</p>
      </header>

      {/* Grid: Responsive layout for branch selection cards */}
      <div className="select-gym-grid">
        {gyms?.map((gym) => (
          <div 
            key={gym.id} 
            className="gym-selection-card"
            onClick={() => handleSelect(gym)}
          >
            <div className="gym-card-icon">
              <span className="material-symbols-outlined" style={{fontSize: "2rem"}}>gymnastics</span>
            </div>
            
            <div className="gym-card-info">
              <h2 className="gym-card-name">{gym.nombre}</h2>
              <p className="gym-card-address">
                <span className="material-symbols-outlined" style={{fontSize: "1rem"}}>location_on</span>
                {gym.direccion}
              </p>
            </div>

            <button className="btn-select-gym">
              Acceder al Centro
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
