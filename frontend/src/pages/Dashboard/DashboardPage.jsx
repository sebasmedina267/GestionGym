import React, { useRef } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useDashboardLogic } from "./useDashboardLogic";
import DashboardHeader from "./DashboardHeader";
import DashboardStatsGrid from "./DashboardStatsGrid";
import DashboardAgenda from "./DashboardAgenda";
import DashboardInsights from "./DashboardInsights";
import { exportDashboardPDF } from "../Economia/pdfUtils";
import "./Styles/DashboardPage.css";

export default function DashboardPage() {
  const { gym, clases, stats, refetchAll } = useDashboardLogic();

  return (
    <AppLayout>
      <div className="dashboard-page-container">
        <DashboardHeader 
           gym={gym} 
           onExport={() => exportDashboardPDF({ gym, stats, clases }, "Dashboard_FitFlow.pdf")} 
           onSync={refetchAll} 
        />
        <DashboardStatsGrid stats={stats} />

        <section className="dashboard-layout-grid">
          <DashboardAgenda clases={clases} />
          <DashboardInsights stats={stats} />
        </section>
      </div>
    </AppLayout>
  );
}
