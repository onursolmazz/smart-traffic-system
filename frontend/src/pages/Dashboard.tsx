import { useEffect, useState } from "react";

import { Camera, Car, RadioTower, TriangleAlert } from "lucide-react";

import ActiveTrafficEvents from "../components/ActiveTrafficEvents";
import DashboardTrafficMap from "../components/DashboardTrafficMap";
import RecentViolationsTable from "../components/RecentViolationsTable";
import StatCard from "../components/StatCard";
import ViolationChart from "../components/ViolationChart";

import Loading from "../components/ui/Loading";

import api from "../services/api";

import type { DashboardResponse } from "../types/dashboard";

import type { Camera as CameraType, CamerasResponse } from "../types/camera";

function Dashboard() {
  const [dashboard, setDashboard] = useState<DashboardResponse | null>(null);

  const [cameras, setCameras] = useState<CameraType[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  useEffect(() => {
    let cancelled = false;

    const loadDashboard = async () => {
      try {
        const [dashboardResponse, camerasResponse] = await Promise.all([
          api.get<DashboardResponse>("/dashboard"),

          api.get<CamerasResponse>("/cameras", {
            params: {
              per_page: 100,

              sort_by: "name",

              sort_direction: "asc",
            },
          }),
        ]);

        if (cancelled) {
          return;
        }

        setDashboard(dashboardResponse.data);

        setCameras(camerasResponse.data.data);

        setLastUpdated(new Date());

        setError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("GÖSTERGE PANELİ HATASI:", error);

        setError("Gösterge paneli verileri alınamadı.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadDashboard();

    const intervalId = window.setInterval(() => {
      void loadDashboard();
    }, 30_000);

    return () => {
      cancelled = true;

      window.clearInterval(intervalId);
    };
  }, []);

  if (loading) {
    return <Loading text="Gösterge paneli yükleniyor..." />;
  }

  if (error && !dashboard) {
    return <div className="page-message error-message">{error}</div>;
  }

  if (!dashboard) {
    return null;
  }

  return (
    <div className="dashboard-page">
      <div className="dashboard-live-row">
        <div className="live-indicator">
          <span className="live-dot" />
          Canlı sistem
        </div>

        {lastUpdated && (
          <span className="last-updated">
            Son güncelleme:{" "}
            {lastUpdated.toLocaleTimeString("tr-TR", {
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </span>
        )}
      </div>

      {error && (
        <div className="dashboard-refresh-error">
          Son yenilemede bir hata oluştu. Mevcut veriler gösterilmeye devam
          ediyor.
        </div>
      )}

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

      <section className="panel dashboard-map-panel">
        <div className="panel-header">
          <div>
            <h3>Canlı Trafik Haritası</h3>

            <p>Kamera ve aktif trafik olaylarının konumları</p>
          </div>

          <div className="dashboard-map-summary">
            <span>{cameras.length} Kamera</span>

            <span>{dashboard.active_traffic_events.length} Aktif Olay</span>
          </div>
        </div>

        <DashboardTrafficMap
          cameras={cameras}
          events={dashboard.active_traffic_events}
        />
      </section>

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
