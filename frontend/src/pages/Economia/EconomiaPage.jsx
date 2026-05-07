import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useGym } from "../../hooks/useGym";
import { useEconomia } from "./useEconomia";
import { exportEconomiaPDF } from "./pdfUtils";
import ResumenSection from "./ResumenSection";
import ChartsSection from "./ChartsSection";
import MovimientosTable from "./MovimientosTable";
import EconomiaModalForm from "./EconomiaModalForm";
import api from "../../api/axios";
import "./Styles/EconomiaPage.css";

/**
 * EconomiaPage Component
 * 
 * The central financial ledger for the gym branch.
 * Provides a high-fidelity dashboard for tracking revenue, expenses, and profitability.
 * 
 * Key Features:
 * - Real-time financial metrics (Revenue, Expenses, Net Profit, Margin %).
 * - Data visualization via charts for income and expense distribution.
 * - Transactional ledger with advanced filtering.
 * - Manual record entry for miscellaneous financial events.
 * - Professional PDF report generation for financial audits.
 */
export default function EconomiaPage() {
  const { gym } = useGym();
  const gymReady = Boolean(gym);
  const pdfRef = useRef(null);

  // Time-based context (Current Month)
  const currentMonth = new Date().toISOString().substring(0, 7);
  
  // UI State
  const [filtroTipo, setFiltroTipo] = useState("TODOS");
  const [openModal, setOpenModal] = useState(false);
  const [formType, setFormType] = useState(null); // 'INGRESO' or 'GASTO'
  const [form, setForm] = useState({ 
    descripcion: "", 
    importe: "", 
    fecha: new Date().toISOString().split("T")[0], 
    categoria: "" 
  });
  const [saving, setSaving] = useState(false);

  // Predefined tax/accounting categories for classification in Spanish
  const incomeCategories = ["Servicios de Membresía", "Ventas Minoristas", "Inversión de Capital", "Misceláneos"];
  const expenseCategories = ["Alquiler de Instalaciones", "Servicios Públicos", "Nómina de Personal", "Mantenimiento de Equipo", "Otros"];

  /** 
   * Computes the date range for the current fiscal period (Full Month)
   */
  const [startDate, endDate] = useMemo(() => {
    const [year, month] = currentMonth.split("-");
    return [`${currentMonth}-01`, new Date(year, month, 0).toISOString().split("T")[0]];
  }, [currentMonth]);

  // Orchestrate financial data through specialized logic hook
  const { 
    resumen, 
    ingresosFuentes, 
    gastosFuentes, 
    sortedMovimientos, 
    fetchData 
  } = useEconomia(gymReady, startDate, endDate);

  /** 
   * Profit Margin Calculation
   * Identifies the percentage of revenue that converts to net income.
   */
  const calcMargin = useCallback(() => {
    if (resumen.ingresos === 0) return 0;
    return ((resumen.beneficios / resumen.ingresos) * 100).toFixed(1);
  }, [resumen]);

  /** 
   * Synchronize data on initial load and when parameters change
   */
  useEffect(() => {
    fetchData();
  }, [fetchData]);

  /** Initializes the registration form for a financial event */
  const handleOpenForm = (type) => {
    setFormType(type);
    setForm({ 
      descripcion: "", 
      importe: "", 
      fecha: new Date().toISOString().split("T")[0], 
      categoria: "" 
    });
    setOpenModal(true);
  };

  /** Persists a financial transaction to the ledger */
  const handleSubmitForm = async () => {
    if (!form.descripcion || !form.importe || !form.fecha) return alert("Faltan campos obligatorios.");
    
    try {
      setSaving(true);
      const payload = { ...form, importe: Number(form.importe) };
      const endpoint = formType === "INGRESO" ? "/economia/ingresos" : "/economia/gastos";
      
      await api.post(endpoint, payload);
      
      setOpenModal(false);
      fetchData(); // Refresh the ledger and summary
    } catch (err) {
      console.error("Financial Write Error:", err);
      alert("Error al guardar el registro financiero.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout title="Inteligencia Financiera">
      {/* --- Action Bar: Global Operations --- */}
      <div className="economia-btn-group">
        <button className="btn-primary" onClick={() => handleOpenForm("INGRESO")}>
          Registrar Ingreso
        </button>
        <button className="btn-danger" onClick={() => handleOpenForm("GASTO")}>
          Registrar Gasto
        </button>
        <button 
          className="btn-secondary" 
          onClick={() => exportEconomiaPDF({
            gym,
            resumen,
            ingresosFuentes,
            gastosFuentes,
            movimientos: sortedMovimientos
          }, "FitFlow_Reporte_Financiero.pdf")}
        >
          Generar Reporte PDF
        </button>
      </div>

      {/* --- Main Analytics Engine View --- */}
      <div ref={pdfRef} className="economia-redesign-container">
        {/* Aggregate Financial Metrics */}
        <ResumenSection resumen={resumen} calcMargin={calcMargin} />
        
        {/* Data Visualization Grid */}
        <ChartsSection 
          resumen={resumen} 
          ingresosFuentes={ingresosFuentes} 
          gastosFuentes={gastosFuentes} 
        />
        
        {/* Detailed Transactional Ledger */}
        <MovimientosTable 
          movimientos={sortedMovimientos} 
          filtroTipo={filtroTipo} 
          setFiltroTipo={setFiltroTipo} 
        />
      </div>

      {/* --- Entry Portal: Financial Form Modal --- */}
      <EconomiaModalForm
        open={openModal}
        onClose={() => setOpenModal(false)}
        formType={formType}
        form={form}
        setForm={setForm}
        saving={saving}
        onSubmit={handleSubmitForm}
        categorias={formType === "INGRESO" ? incomeCategories : expenseCategories}
      />
    </AppLayout>
  );
}