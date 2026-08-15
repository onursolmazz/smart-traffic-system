import { Bell, CheckCheck, CircleAlert, Search } from "lucide-react";
import { useEffect, useState } from "react";
import api from "../services/api";
import Loading from "../components/ui/Loading";
import ViolationDetailModal from "../components/ViolationDetailModal";

import type { Alert, AlertsPageResponse, AlertSeverity } from "../types/alert";

type AlertStatus = "" | "unread" | "read";

function getSeverityLabel(severity: AlertSeverity) {
  const labels: Record<AlertSeverity, string> = {
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
    critical: "Kritik",
  };

  return labels[severity];
}

function Alerts() {
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loading, setLoading] = useState(true);
  const [status, setStatus] = useState<AlertStatus>("");
  const [severity, setSeverity] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [unreadCount, setUnreadCount] = useState(0);
  const [error, setError] = useState("");
  const [selectedViolationId, setSelectedViolationId] = useState<number | null>(
    null,
  );

  const [detailModalOpen, setDetailModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const loadAlerts = async () => {
      setLoading(true);

      try {
        const response = await api.get<AlertsPageResponse>("/alerts", {
          params: {
            page,
            per_page: 15,
            status: status || undefined,
            severity: severity || undefined,
            search: search || undefined,
          },
        });

        if (cancelled) {
          return;
        }

        setAlerts(response.data.data);

        setUnreadCount(response.data.unread_count);

        setLastPage(response.data.meta.last_page);

        setTotal(response.data.meta.total);

        setError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("BİLDİRİMLER ALINAMADI:", error);

        setError("Bildirimler alınamadı.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    const timeout = window.setTimeout(() => {
      void loadAlerts();
    }, 300);

    return () => {
      cancelled = true;

      window.clearTimeout(timeout);
    };
  }, [page, status, severity, search]);

  const markAsRead = async (alert: Alert) => {
    if (alert.is_read) {
      return;
    }

    try {
      await api.patch(`/alerts/${alert.id}/read`);

      setAlerts((current) =>
        current.map((item) =>
          item.id === alert.id
            ? {
                ...item,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : item,
        ),
      );

      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (error) {
      console.error("BİLDİRİM OKUNAMADI:", error);
    }
  };

  const handleAlertClick = async (alert: Alert) => {
    await markAsRead(alert);

    if (alert.violation_id === null) {
      return;
    }

    setSelectedViolationId(alert.violation_id);

    setDetailModalOpen(true);
  };

  const markAllAsRead = async () => {
    try {
      await api.patch("/alerts/read-all");

      const now = new Date().toISOString();

      setAlerts((current) =>
        current.map((alert) => ({
          ...alert,
          is_read: true,
          read_at: alert.read_at ?? now,
        })),
      );

      setUnreadCount(0);
    } catch (error) {
      console.error("BİLDİRİMLER OKUNAMADI:", error);
    }
  };

  const handleStatusChange = (newStatus: AlertStatus) => {
    setStatus(newStatus);

    setPage(1);
  };

  const handleSeverityChange = (newSeverity: string) => {
    setSeverity(newSeverity);

    setPage(1);
  };

  const handleCloseDetail = () => {
    setDetailModalOpen(false);

    setSelectedViolationId(null);
  };

  return (
    <div className="alerts-page">
      <div className="alerts-topbar">
        <div>
          <h1>Bildirimler</h1>

          <p>
            Trafik ihlallerinden oluşturulan sistem uyarılarını görüntüleyin.
          </p>
        </div>

        <button
          type="button"
          className="alerts-read-all"
          onClick={markAllAsRead}
          disabled={unreadCount === 0}
        >
          <CheckCheck size={17} />
          Tümünü Okundu Yap
        </button>
      </div>

      <div className="alerts-summary">
        <div>
          <Bell size={18} />

          <span>Toplam</span>

          <strong>{total}</strong>
        </div>

        <div>
          <CircleAlert size={18} />

          <span>Okunmamış</span>

          <strong>{unreadCount}</strong>
        </div>
      </div>

      <div className="alerts-filters">
        <div className="alerts-search">
          <Search size={16} />

          <input
            value={search}
            placeholder="Bildirim ara..."
            onChange={(event) => {
              setSearch(event.target.value);

              setPage(1);
            }}
          />
        </div>

        <select
          value={status}
          onChange={(event) =>
            handleStatusChange(event.target.value as AlertStatus)
          }
        >
          <option value="">Tüm Durumlar</option>

          <option value="unread">Okunmamış</option>

          <option value="read">Okunmuş</option>
        </select>

        <select
          value={severity}
          onChange={(event) => handleSeverityChange(event.target.value)}
        >
          <option value="">Tüm Önem Seviyeleri</option>

          <option value="critical">Kritik</option>

          <option value="high">Yüksek</option>

          <option value="medium">Orta</option>

          <option value="low">Düşük</option>
        </select>
      </div>

      {error && <div className="form-error">{error}</div>}

      {loading ? (
        <Loading text="Bildirimler yükleniyor..." />
      ) : alerts.length === 0 ? (
        <div className="alerts-empty">
          <Bell size={36} />

          <strong>Bildirim bulunamadı</strong>

          <span>Seçtiğiniz filtrelere uygun bildirim yok.</span>
        </div>
      ) : (
        <div className="alerts-list">
          {alerts.map((alert) => (
            <button
              type="button"
              key={alert.id}
              className={`alerts-list-item ${alert.is_read ? "" : "unread"}`}
              onClick={() => void handleAlertClick(alert)}
            >
              <div className={`alerts-list-icon ${alert.severity}`}>
                <CircleAlert size={20} />
              </div>

              <div className="alerts-list-content">
                <div className="alerts-list-title">
                  <strong>{alert.title}</strong>

                  {!alert.is_read && <span className="alerts-unread-dot" />}
                </div>

                <p>{alert.message}</p>

                <div className="alerts-list-meta">
                  <span className={`alerts-severity ${alert.severity}`}>
                    {getSeverityLabel(alert.severity)}
                  </span>

                  {alert.violation?.vehicle?.plate && (
                    <span>{alert.violation.vehicle.plate}</span>
                  )}

                  {alert.violation?.camera?.code && (
                    <span>{alert.violation.camera.code}</span>
                  )}

                  <span>
                    {new Date(alert.created_at).toLocaleString("tr-TR")}
                  </span>
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {lastPage > 1 && (
        <div className="pagination">
          <button
            type="button"
            disabled={page === 1}
            onClick={() => setPage((current) => Math.max(current - 1, 1))}
          >
            Önceki
          </button>

          <span>
            {page} / {lastPage}
          </span>

          <button
            type="button"
            disabled={page === lastPage}
            onClick={() =>
              setPage((current) => Math.min(current + 1, lastPage))
            }
          >
            Sonraki
          </button>
        </div>
      )}

      <ViolationDetailModal
        open={detailModalOpen}
        violationId={selectedViolationId}
        onClose={handleCloseDetail}
      />
    </div>
  );
}

export default Alerts;
