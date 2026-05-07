import React, { useRef } from "react";
import AppLayout from "../../components/layout/AppLayout";
import { useDashboardLogic } from "./useDashboardLogic";
import DashboardHeader from "./DashboardHeader";
import DashboardStatsGrid from "./DashboardStatsGrid";
import DashboardAgenda from "./DashboardAgenda";
import DashboardInsights from "./DashboardInsights";
import { exportDashboardPDF } from "../Economia/pdfUtils";
import "./Styles/DashboardPage.css";

/**
 * DashboardPage Component
 * 
 * The central management hub for gym branch operations. 
 * Orchestrates multiple sub-components to display real-time statistics, 
 * daily schedules, and business insights.
 */
export default function DashboardPage() {
  // Leverage custom logic hook for data fetching and state management
  const { gym, clases, stats, refetchAll } = useDashboardLogic();

  return (
    <AppLayout>
      <div className="dashboard-page-container">
        
        {/* Top Header: Displays gym identity and provides global actions (Export, Sync) */}
        <DashboardHeader 
           gym={gym} 
           onExport={() => exportDashboardPDF({ gym, stats, clases }, "Dashboard_FitFlow.pdf")} 
           onSync={refetchAll} 
        />

        {/* Numeric Overview: High-level metrics grid (Users, Revenue, Occupancy) */}
        <DashboardStatsGrid stats={stats} />

        {/* 
          Main Dashboard Body:
          A responsive grid containing the daily agenda and automated insights.
        */}
        <section className="dashboard-layout-grid">
          {/* Daily Schedule: Displays upcoming classes and events */}
          <DashboardAgenda clases={clases} />
          
          {/* Performance Insights: AI-driven or statistical trend analysis */}
          <DashboardInsights stats={stats} />
        </section>
      </div>
    </AppLayout>
  );
}
