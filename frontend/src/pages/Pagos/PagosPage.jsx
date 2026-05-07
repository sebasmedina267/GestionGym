import React, { useRef } from "react";
import AppLayout from "../../components/layout/AppLayout";
import Header from "../../components/ui/Header";
import { usePagosLogic } from "./usePagosLogic";
import PagosFiltros from "./PagosFiltros";
import PagosTabla from "./PagosTabla";
import PagosResumen from "./PagosResumen";
import PagosModals from "./PagosModals";
import { exportEconomiaPDF } from "../Economia/pdfUtils";
import "./Styles/PagosPage.css";

/**
 * PagosPage Component
 * 
 * Orchestrates the client-side financial lifecycle, specifically focusing on class enrollments 
 * and monthly membership collections.
 * 
 * Features:
 * - Discipline-specific filtering for targeted financial oversight.
 * - Real-time payment status tracking (Paid vs. Overdue).
 * - Accelerated "Quick Pay" workflow for manual desk collections.
 * - Integrated financial reporting with PDF export capabilities.
 * - Dynamic data visualization of revenue streams and payment methods.
 */
export default function PagosPage() {
  const logic = usePagosLogic();
  const pdfRef = useRef();

  /** Guard: Ensures the branch context is fully hydrated before rendering interactive elements */
  if (!logic.gymReady) {
    return (
      <AppLayout>
        <div className="loading">Cargando...</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="pagos-page">
        <Header title="Control de Pagos de Clientes" />

        {/* Global Control Bar: Discipline selection and temporal scoping (Month) */}
        <PagosFiltros
          claseId={logic.claseId}
          setClaseId={logic.setClaseId}
          clases={logic.clases}
          mes={logic.mes}
          setMes={logic.setMes}
          clasePrecio={logic.clasePrecio}
        />

        {logic.claseId ? (
          <div className="pagos-grid" ref={pdfRef}>
            {/* Primary Ledger: Detailed member enrollment and payment status grid */}
            <PagosTabla
              clases={logic.clases}
              claseId={logic.claseId}
              clasePrecio={logic.clasePrecio}
              loadingEstado={logic.loadingEstado}
              estadoClase={logic.estadoClase}
              handleQuickPayClick={logic.handleQuickPayClick}
            />

            {/* Strategic Summary: High-level analytics and export triggers */}
            <PagosResumen
              classStats={logic.classStats}
              metodoPagoStats={logic.metodoPagoStats}
              chartData={logic.chartData}
              onExport={() => exportEconomiaPDF(pdfRef.current, `reporte_pagos_${logic.mes}.pdf`)}
            />
          </div>
        ) : (
          /* Empty State: Guidance for the user to initiate the management flow */
          <div className="glass-card neon-glow-primary pagos-empty-state">
            <span className="pagos-empty-icon-wrapper">
              <span className="material-symbols-outlined pagos-empty-icon">payments</span>
            </span>
            <h2 className="pagos-empty-title">Selecciona una Disciplina</h2>
            <p className="pagos-empty-desc">
              Elige una clase en el filtro superior para acceder a su lista de alumnos, revisar quién ha pagado este mes, y generar ingresos mediante cobros rápidos.
            </p>
          </div>
        )}

        {/* Subsystem Modals: Managed workflows for payment confirmation and feedback */}
        <PagosModals
          alertModal={logic.alertModal}
          setAlertModal={logic.setAlertModal}
          showMetodoModal={logic.showMetodoModal}
          setShowMetodoModal={logic.setShowMetodoModal}
          clientePendiente={logic.clientePendiente}
          setClientePendiente={logic.setClientePendiente}
          clasePrecio={logic.clasePrecio}
          metodoPago={logic.metodoPago}
          setMetodoPago={logic.setMetodoPago}
          handleConfirmarPago={logic.handleConfirmarPago}
          pagando={logic.pagando}
        />
      </div>
    </AppLayout>
  );
}
