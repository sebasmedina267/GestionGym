import { useState, useCallback, useMemo } from "react";
import api from "../../api/axios";

/**
 * useEconomia Custom Hook
 * 
 * Orchestrates the complex retrieval and aggregation of financial data for a specific gym branch.
 * Responsibilities:
 * - Synchronous data fetching for summaries, income logs, and expense logs.
 * - Categorization and aggregation of income/expense sources for visualization (Charts).
 * - Consolidation and sorting of unified transactional movements.
 * 
 * @param {boolean} gymReady - Flag indicating the gym context is available.
 * @param {string} desde - Start date of the fiscal range.
 * @param {string} hasta - End date of the fiscal range.
 */
export const useEconomia = (gymReady, desde, hasta) => {
  // Aggregate summary state
  const [resumen, setResumen] = useState({ ingresos: 0, gastos: 0, beneficios: 0 });
  
  // Detailed transaction state
  const [ingresosList, setIngresosList] = useState([]);
  const [gastosList, setGastosList] = useState([]);
  const [loading, setLoading] = useState(false);

  /**
   * Fetch Data Action
   * Triggers a coordinated parallel request to retrieve the full financial state 
   * for the current date range.
   */
  const fetchData = useCallback(async () => {
    if (!gymReady) return;
    try {
      setLoading(true);
      const query = `?desde=${desde}&hasta=${hasta}`;
      
      // Parallel execution to optimize network latency
      const [resResumen, resIngresos, resGastos] = await Promise.all([
        api.get(`/economia/resumen${query}`),
        api.get(`/economia/ingresos${query}`),
        api.get(`/economia/gastos${query}`)
      ]);
      
      setResumen(resResumen.data.data);
      setIngresosList(resIngresos.data.data);
      setGastosList(resGastos.data.data);
    } catch (err) {
      console.error("Critical Failure in Financial Sync:", err);
    } finally {
      setLoading(false);
    }
  }, [gymReady, desde, hasta]);

  /** 
   * Aggregates revenue by source type (e.g., MEMBERSHIP, MANUAL_ENTRY) 
   * for distribution charts.
   */
  const ingresosFuentes = useMemo(() => {
    const map = new Map();
    ingresosList.forEach(i => {
      const f = i.fuente_tipo.replace("_", " ");
      map.set(f, (map.get(f) || 0) + Number(i.importe));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [ingresosList]);

  /** 
   * Aggregates expenses by source type for distribution charts.
   */
  const gastosFuentes = useMemo(() => {
    const map = new Map();
    gastosList.forEach(g => {
      const f = g.fuente_tipo.replace("_", " ");
      map.set(f, (map.get(f) || 0) + Number(g.importe));
    });
    return Array.from(map.entries()).map(([name, value]) => ({ name, value }));
  }, [gastosList]);

  /** 
   * Combines income and expenses into a single chronological ledger.
   */
  const sortedMovimientos = useMemo(() => {
    return [
      ...ingresosList.map(i => ({ ...i, tipo: 'INGRESO' })),
      ...gastosList.map(g => ({ ...g, tipo: 'GASTO' }))
    ].sort((a, b) => new Date(b.fecha) - new Date(a.fecha));
  }, [ingresosList, gastosList]);

  return { 
    resumen, 
    ingresosList, 
    gastosList, 
    ingresosFuentes, 
    gastosFuentes, 
    sortedMovimientos, 
    loading, 
    fetchData 
  };
};