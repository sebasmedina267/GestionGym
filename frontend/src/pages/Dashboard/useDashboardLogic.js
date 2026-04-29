import { useMemo } from "react";
import { useGym } from "../../hooks/useGym";
import { useFetch } from "../../hooks/useFetch";

export function useDashboardLogic() {
  const { gym } = useGym();
  const gymReady = Boolean(gym);

  // Fetch data
  const { data: clientes, refetch: refetchClientes } = useFetch(
    gymReady ? `/clientes?gymId=${gym.id}` : null
  );
  const { data: clases, refetch: refetchClases } = useFetch(
    gymReady ? `/clases?gymId=${gym.id}` : null
  );
  // Pagos pendientes directamente desde el endpoint correcto
  const { data: pagosPendientesData, refetch: refetchPagos } = useFetch(
    gymReady ? `/pagos/pendientes` : null
  );
  const { data: economiaResumen, refetch: refetchEconomia } = useFetch(
    gymReady && gym
      ? `/economia/resumen?gymId=${gym.id}&desde=2000-01-01&hasta=2099-12-31`
      : null
  );

  const refetchAll = async () => {
    await Promise.all([
      refetchClientes(),
      refetchClases(),
      refetchPagos(),
      refetchEconomia()
    ]);
  };

  // Calcular estadísticas
  const stats = useMemo(() => {
    const clientesActivos = Array.isArray(clientes)
      ? clientes.filter((c) => c.activo).length
      : 0;

    const clasesTotales = Array.isArray(clases) ? clases.length : 0;

    // pagosPendientesData ya es el array del endpoint /pagos/pendientes
    const pagosPendientes = Array.isArray(pagosPendientesData)
      ? pagosPendientesData.length
      : 0;

    // Convertir a números para evitar errores de tipo
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
