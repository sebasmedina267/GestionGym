import { useMemo } from "react";
import { useGym } from "../../hooks/useGym";
import { useFetch } from "../../hooks/useFetch";

/**
 * useDashboardLogic Custom Hook
 * 
 * Centralizes data fetching and metric computation for the main dashboard view.
 * Coordinates multiple API calls and aggregates results into a unified 'stats' object.
 */
export function useDashboardLogic() {
  const { gym } = useGym();
  
  // Guard to ensure we only fetch when a gym context is active
  const gymReady = Boolean(gym);

  // --- Data Fetching Operations ---

  // Fetches client list to compute active member counts
  const { data: clientes, refetch: refetchClientes } = useFetch(
    gymReady ? `/clientes?gymId=${gym.id}` : null
  );

  // Fetches daily class schedule
  const { data: clases, refetch: refetchClases } = useFetch(
    gymReady ? `/clases?gymId=${gym.id}` : null
  );

  // Fetches pending transactions for financial awareness
  const { data: pagosPendientesData, refetch: refetchPagos } = useFetch(
    gymReady ? `/pagos/pendientes` : null
  );

  // Fetches high-level financial summary (Total income vs expenses)
  const { data: economiaResumen, refetch: refetchEconomia } = useFetch(
    gymReady && gym
      ? `/economia/resumen?gymId=${gym.id}&desde=2000-01-01&hasta=2099-12-31`
      : null
  );

  /**
   * Refreshes all dashboard data sources simultaneously.
   */
  const refetchAll = async () => {
    await Promise.all([
      refetchClientes(),
      refetchClases(),
      refetchPagos(),
      refetchEconomia()
    ]);
  };

  /**
   * Stat Computation:
   * Aggregates raw fetched data into business-ready metrics.
   * Memoized to prevent unnecessary recalculations on every render.
   */
  const stats = useMemo(() => {
    const clientesActivos = Array.isArray(clientes)
      ? clientes.filter((c) => c.activo).length
      : 0;

    const clasesTotales = Array.isArray(clases) ? clases.length : 0;

    const pagosPendientes = Array.isArray(pagosPendientesData)
      ? pagosPendientesData.length
      : 0;

    // Normalizing financial data for safe arithmetic
    const ingresos = Number(economiaResumen?.ingresos) || 0;
    const gastos = Number(economiaResumen?.gastos) || 0;
    const balance = ingresos - gastos;

    return {
      clientesActivos,
      clasesTotales,
      pagosPendientes,
      ingresos,
      gastos,
      balance,
    };
  }, [clientes, clases, pagosPendientesData, economiaResumen]);

  return {
    gym,
    clases,
    stats,
    refetchAll
  };
}
