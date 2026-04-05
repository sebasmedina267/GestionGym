import { useFetch } from "../../hooks/useFetch";

export function useClientes(gymId) {
  const url = gymId ? `/clientes?gymId=${gymId}` : null;
  const { data, loading, refetch } = useFetch(url);

  const statsUrl = gymId ? `/clientes/stats?gymId=${gymId}` : null;
  const { data: stats } = useFetch(statsUrl);

  return {
    clientes: data || [],
    stats: stats || {},
    loading,
    refetch,
  };
}