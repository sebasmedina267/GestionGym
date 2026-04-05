import React from "react";
import AppLayout from "../../components/layout/AppLayout";
import Header from "../../components/ui/Header";
import { usePagosLogic } from "./usePagosLogic";
import PagosFiltros from "./PagosFiltros";
import PagosTabla from "./PagosTabla";
import PagosResumen from "./PagosResumen";
import PagosModals from "./PagosModals";
import "../../styles/pagos.css";

export default function PagosPage() {
  const logic = usePagosLogic();

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

        <PagosFiltros
          claseId={logic.claseId}
          setClaseId={logic.setClaseId}
          clases={logic.clases}
          mes={logic.mes}
          setMes={logic.setMes}
          clasePrecio={logic.clasePrecio}
        />

        {logic.claseId ? (
          <div className="pagos-grid">
            <PagosTabla
              clases={logic.clases}
              claseId={logic.claseId}
              clasePrecio={logic.clasePrecio}
              loadingEstado={logic.loadingEstado}
              estadoClase={logic.estadoClase}
              handleQuickPayClick={logic.handleQuickPayClick}
            />

            <PagosResumen
              classStats={logic.classStats}
              metodoPagoStats={logic.metodoPagoStats}
              chartData={logic.chartData}
            />
          </div>
        ) : (
          <div className="glass-card neon-glow-primary" style={{ marginTop: "40px", padding: "80px", textAlign: "center" }}>
            <span style={{ fontSize: "4rem", display: "block", marginBottom: "24px", filter: "drop-shadow(0 0 15px rgba(129, 140, 248, 0.4))" }}>
              <span className="material-symbols-outlined" style={{ fontSize: "inherit" }}>payments</span>
            </span>
            <h2 style={{ fontSize: "1.75rem", marginBottom: "12px" }}>Selecciona una Disciplina</h2>
            <p style={{ color: "var(--on-surface-variant)", maxWidth: "500px", margin: "0 auto", fontSize: "1rem", lineHeight: "1.6" }}>
              Elige una clase en el filtro superior para acceder a su lista de alumnos, revisar quién ha pagado este mes, y generar ingresos mediante cobros rápidos.
            </p>
          </div>
        )}

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

