// useEconomia.js
import { useState, useCallback, useMemo } from "react";
import api from "../../api/axios";

export const useEconomia = (gymReady, desde, hasta) => {
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, beneficios: 0 });
  const [ingresosList, setIngresosList] = useState([]);
  const [gastosList, setGastosList] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = useCallback(async () => {
    if (!gymReady) return;
    try {
      setLoading(true);
      const query = `?desde=${desde}&hasta=${hasta}`;
      const [resResumen, resIngresos, resGastos] = await Promise.all([
        api.get(`/economia/resumen${query}`),
        api.get(`/economia/ingresos${query}`),
        api.get(`/economia/gastos${query}`)
      ]);
      setResumen(resResumen.data.data);
      setIngresosList(resIngresos.data.data);
      setGastosList(resGastos.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [gymReady, desde, hasta]);

  const ingresosFuentes = useMemo(() => {
    const map = new Map();
    ingresosList.forEach(i => {
      const f = i.fuente_tipo.replace("_", " ");
      map.set(f, (map.get(f) || 0) + Number(i.importe));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [ingresosList]);

  const gastosFuentes = useMemo(() => {
    const map = new Map();
    gastosList.forEach(g => {
      const f = g.fuente_tipo.replace("_", " ");
      map.set(f, (map.get(f) || 0) + Number(g.importe));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [gastosList]);

  const sortedMovimientos = useMemo(() => {
    return [
      ...ingresosList.map(i => ({ ...i, tipo: 'INGRESO' })),
      ...gastosList.map(g => ({ ...g, tipo: 'GASTO' }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [ingresosList, gastosList]);

  return { resumen, ingresosList, gastosList, ingresosFuentes, gastosFuentes, sortedMovimientos, loading, fetchData };
};