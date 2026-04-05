import { useMemo } from "react";
import { useGym } from "../../hooks/useGym";
import { useFetch } from "../../hooks/useFetch";

export function useDashboardLogic() {
  const { gym } = useGym();
  const gymReady = Boolean(gym);

  // Fetch data
  const { data: clientes } = useFetch(
    gymReady ? `/clientes?gymId=${gym.id}` : null
  );
  const { data: clases } = useFetch(
    gymReady ? `/clases?gymId=${gym.id}` : null
  );
  // Pagos pendientes directamente desde el endpoint correcto
  const { data: pagosPendientesData } = useFetch(
    gymReady ? `/pagos/pendientes` : null
  );
  const { data: economiaResumen } = useFetch(
    gymReady && gym
      ? `/economia/resumen?gymId=${gym.id}&desde=2000-01-01&hasta=2099-12-31`
      : null
  );

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
  };
}
