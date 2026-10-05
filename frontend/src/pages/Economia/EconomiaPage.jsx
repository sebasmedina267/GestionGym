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
  const [editingItem, setEditingItem] = useState(null);
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
    setEditingItem(null);
    setFormType(type);
    setForm({ 
      descripcion: "", 
      importe: "", 
      fecha: new Date().toISOString().split("T")[0], 
      categoria: "" 
    });
    setOpenModal(true);
  };

  /** Prepares an entry for editing */
  const handleEdit = (movimiento) => {
    setEditingItem(movimiento);
    setFormType(movimiento.tipo);
    setForm({
      descripcion: movimiento.descripcion || "",
      importe: String(movimiento.importe || ""),
      fecha: movimiento.fecha ? new Date(movimiento.fecha).toISOString().split("T")[0] : new Date().toISOString().split("T")[0],
      categoria: movimiento.categoria || ""
    });
    setOpenModal(true);
  };

  /** Deletes a financial record with confirmation */
  const handleDelete = async (movimiento) => {
    if (!window.confirm(`¿Estás seguro de que deseas eliminar este ${movimiento.tipo.toLowerCase()} ("${movimiento.descripcion}") por $${movimiento.importe}?`)) {
      return;
    }

    try {
      const endpoint = movimiento.tipo === "INGRESO" ? `/economia/ingresos/${movimiento.id}` : `/economia/gastos/${movimiento.id}`;
      await api.delete(endpoint);
      fetchData();
    } catch (err) {
      console.error("Error deleting financial record:", err);
      alert(err.response?.data?.message || "Error al eliminar el registro.");
    }
  };

  /** Persists a financial transaction to the ledger (Create or Update) */
  const handleSubmitForm = async () => {
    if (!form.descripcion || !form.importe || !form.fecha) return alert("Faltan campos obligatorios.");
    
    try {
      setSaving(true);
      const payload = { ...form, importe: Number(form.importe) };
      
      if (editingItem) {
        const endpoint = formType === "INGRESO" 
          ? `/economia/ingresos/${editingItem.id}` 
          : `/economia/gastos/${editingItem.id}`;
        await api.put(endpoint, payload);
      } else {
        const endpoint = formType === "INGRESO" ? "/economia/ingresos" : "/economia/gastos";
        await api.post(endpoint, payload);
      }
      
      setOpenModal(false);
      setEditingItem(null);
      fetchData(); // Refresh the ledger and summary
    } catch (err) {
      console.error("Financial Write Error:", err);
      alert(err.response?.data?.message || "Error al guardar el registro financiero.");
    } finally {
      setSaving(false);
    }
  };

  /** Handles downloading financial reports as PDF */
  const handleDownloadPDF = async (reportType) => {
    try {
      const params = new URLSearchParams();
      if (startDate) params.append("desde", startDate);
      if (endDate) params.append("hasta", endDate);

      const response = await api.get(`/economia/pdf/${reportType}?${params}`, {
        responseType: "blob",
      });

      // Create blob and download
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement("a");
      link.href = url;
      link.setAttribute(
        "download",
        `Reporte_${reportType}_${new Date().toISOString().split("T")[0]}.pdf`
      );
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error descargando PDF:", err);
      alert("Error al descargar el reporte PDF");
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
          Generar Reporte PDF (Local)
        </button>
        <button 
          className="btn-info" 
          onClick={() => handleDownloadPDF("resumen")}
        >
          Descargar Resumen PDF
        </button>
        <button 
          className="btn-success" 
          onClick={() => handleDownloadPDF("ingresos")}
        >
          Descargar Ingresos PDF
        </button>
        <button 
          className="btn-warning" 
          onClick={() => handleDownloadPDF("gastos")}
        >
          Descargar Gastos PDF
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
          onEdit={handleEdit}
          onDelete={handleDelete}
        />
      </div>

      {/* --- Entry Portal: Financial Form Modal --- */}
      <EconomiaModalForm
        open={openModal}
        onClose={() => {
          setOpenModal(false);
          setEditingItem(null);
        }}
        formType={formType}
        form={form}
        setForm={setForm}
        saving={saving}
        onSubmit={handleSubmitForm}
        categorias={formType === "INGRESO" ? incomeCategories : expenseCategories}
        isEditing={Boolean(editingItem)}
      />
    </AppLayout>
  );
}