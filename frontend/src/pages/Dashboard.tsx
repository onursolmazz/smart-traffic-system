import { useEffect, useState } from "react";
import { Camera, Car, TriangleAlert, RadioTower } from "lucide-react";
import ActiveTrafficEvents from "../components/ActiveTrafficEvents";
import RecentViolationsTable from "../components/RecentViolationsTable";
import ViolationChart from "../components/ViolationChart";
import api from "../services/api";
import StatCard from "../components/StatCard";

import type { DashboardResponse } from "../types/dashboard";

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    const fetchDashboard = async () => {
      try {
        const response = await api.get<DashboardResponse>("/dashboard");

        setDashboard(response.data);
      } catch (error) {
        console.error(error);

        setError("Dashboard verileri alınamadı.");
      } finally {
        setLoading(false);
      }
    };

    fetchDashboard();
  }, []);

  if (loading) {
    return <div className="page-message">Dashboard yükleniyor...</div>;
  }

  if (error) {
    return <div className="page-message error-message">{error}</div>;
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="stats-grid">
        <StatCard
          title="Total Vehicles"
          value={dashboard.total_vehicles}
          icon={Car}
          description="Registered vehicles"
        />

        <StatCard
          title="Active Cameras"
          value={dashboard.active_cameras}
          icon={Camera}
          description="Currently online"
        />

        <StatCard
          title="Today's Violations"
          value={dashboard.today_violations}
          icon={TriangleAlert}
          description="Detected today"
        />

        <StatCard
          title="Active Events"
          value={dashboard.active_events}
          icon={RadioTower}
          description="Ongoing traffic events"
        />
      </div>

      <div className="dashboard-content-grid">
        <section className="panel chart-placeholder">
          <div className="panel-header">
            <div>
              <h3>Violation Statistics</h3>
              <p>Today's violations by type</p>
            </div>
          </div>
          <ViolationChart data={dashboard.violations_by_type} />{" "}
        </section>

        <section className="panel events-placeholder">
          <div className="panel-header">
            <div>
              <h3>Active Traffic Events</h3>
              <p>Latest incidents on the road</p>
            </div>
          </div>

          <ActiveTrafficEvents events={dashboard.active_traffic_events} />
        </section>
      </div>

      <section className="panel recent-violations">
        <div className="panel-header">
          <div>
            <h3>Recent Violations</h3>
            <p>Latest detected traffic violations</p>
          </div>
        </div>

        <RecentViolationsTable violations={dashboard.recent_violations} />
      </section>
    </div>
  );
}

export default Dashboard;
