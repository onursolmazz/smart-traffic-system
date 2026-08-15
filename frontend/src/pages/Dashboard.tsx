import { useEffect, useState } from "react";

import { Camera, Car, RadioTower, TriangleAlert } from "lucide-react";

import ActiveTrafficEvents from "../components/ActiveTrafficEvents";
import RecentViolationsTable from "../components/RecentViolationsTable";
import StatCard from "../components/StatCard";
import ViolationChart from "../components/ViolationChart";

import Loading from "../components/ui/Loading";

import api from "../services/api";

import type { DashboardResponse } from "../types/dashboard";

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const fetchDashboard = async () => {
      try {
        const response = await api.get<DashboardResponse>("/dashboard");

        if (cancelled) {
          return;
        }

        setDashboard(response.data);

        setError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);

        setError("Gösterge paneli verileri alınamadı.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, []);

  if (loading) {
    return <Loading text="Gösterge paneli yükleniyor..." />;
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
          title="Toplam Araç"
          value={dashboard.total_vehicles}
          icon={Car}
          description="Sisteme kayıtlı araçlar"
        />

        <StatCard
          title="Aktif Kameralar"
          value={dashboard.active_cameras}
          icon={Camera}
          description="Şu anda aktif kameralar"
        />

        <StatCard
          title="Bugünkü İhlaller"
          value={dashboard.today_violations}
          icon={TriangleAlert}
          description="Bugün tespit edilen ihlaller"
        />

        <StatCard
          title="Aktif Olaylar"
          value={dashboard.active_events}
          icon={RadioTower}
          description="Devam eden trafik olayları"
        />
      </div>

      <div className="dashboard-content-grid">
        <section className="panel chart-placeholder">
          <div className="panel-header">
            <div>
              <h3>İhlal İstatistikleri</h3>

              <p>Bugünkü ihlallerin türlere göre dağılımı</p>
            </div>
          </div>

          <ViolationChart data={dashboard.violations_by_type} />
        </section>

        <section className="panel events-placeholder">
          <div className="panel-header">
            <div>
              <h3>Aktif Trafik Olayları</h3>

              <p>Yoldaki son aktif olaylar</p>
            </div>
          </div>

          <ActiveTrafficEvents events={dashboard.active_traffic_events} />
        </section>
      </div>

      <section className="panel recent-violations">
        <div className="panel-header">
          <div>
            <h3>Son İhlaller</h3>

            <p>Son tespit edilen trafik ihlalleri</p>
          </div>
        </div>

        <RecentViolationsTable violations={dashboard.recent_violations} />
      </section>
    </div>
  );
}

export default Dashboard;
