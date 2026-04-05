import AppLayout from "../../components/layout/AppLayout";
import { useDashboardLogic } from "./useDashboardLogic";
import DashboardHeader from "./DashboardHeader";
import DashboardStatsGrid from "./DashboardStatsGrid";
import DashboardAgenda from "./DashboardAgenda";
import DashboardInsights from "./DashboardInsights";
import "../../styles/dashboard.css";

export default function DashboardPage() {
  const { gym, clases, stats } = useDashboardLogic();

  return (
    <AppLayout>
      <div className="dashboard-v2">
        <DashboardHeader gym={gym} />
        <DashboardStatsGrid stats={stats} />

        <section className="dashboard-v2__grid">
          <DashboardAgenda clases={clases} />
          <DashboardInsights stats={stats} />
        </section>
      </div>
    </AppLayout>
  );
}
