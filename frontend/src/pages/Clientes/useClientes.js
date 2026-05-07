import { useFetch } from "../../hooks/useFetch";

/**
 * useClientes Custom Hook
 * 
 * Orchestrates the retrieval of member-related data for a specific gym branch.
 * Responsibilities:
 * - Synchronizing the member registry with the backend database.
 * - Retrieving demographic and enrollment analytics.
 * - Providing a unified loading state and manual refresh (refetch) capability.
 * 
 * @param {number} gymId - The identifier of the branch context.
 */
export function useClientes(gymId) {
  // Primary member directory query
  const url = gymId ? `/clientes?gymId=${gymId}` : null;
  const { data, loading, refetch } = useFetch(url);

  // Demographic analytics query
  const statsUrl = gymId ? `/clientes/stats?gymId=${gymId}` : null;
  const { data: stats } = useFetch(statsUrl);

  return {
    clientes: data || [],
    stats: stats || {},
    loading,
    refetch,
  };
}