import { Bell, CheckCheck, CircleAlert, X } from "lucide-react";

import { useCallback, useEffect, useRef, useState } from "react";

import { Link, useLocation } from "react-router-dom";

import api from "../services/api";

import type { Alert, AlertsResponse, AlertSeverity } from "../types/alert";

interface PageInfo {
  title: string;
  description: string;
}

const pageInfo: Record<string, PageInfo> = {
  "/dashboard": {
    title: "Gösterge Paneli",
    description: "Trafik sisteminin genel durumunu görüntüleyin.",
  },

  "/map": {
    title: "Trafik Haritası",
    description:
      "Kameraları ve trafik olaylarını harita üzerinde görüntüleyin.",
  },

  "/vehicles": {
    title: "Araçlar",
    description: "Sistemde kayıtlı araçları görüntüleyin ve yönetin.",
  },

  "/cameras": {
    title: "Kameralar",
    description: "Trafik kameralarını görüntüleyin ve yönetin.",
  },

  "/violations": {
    title: "İhlaller",
    description: "Trafik ihlallerini görüntüleyin ve yönetin.",
  },

  "/traffic-events": {
    title: "Trafik Olayları",
    description: "Trafik olaylarını görüntüleyin ve yönetin.",
  },

  "/alerts": {
    title: "Bildirimler",
    description:
      "Trafik ihlallerinden oluşturulan sistem uyarılarını görüntüleyin.",
  },
};

function getSeverityLabel(severity: AlertSeverity) {
  const labels: Record<AlertSeverity, string> = {
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
    critical: "Kritik",
  };

  return labels[severity];
}

function getRelativeTime(dateString: string) {
  const createdAt = new Date(dateString);

  const now = new Date();

  const difference = now.getTime() - createdAt.getTime();

  const seconds = Math.floor(difference / 1000);

  if (seconds < 60) {
    return "Az önce";
  }

  const minutes = Math.floor(seconds / 60);

  if (minutes < 60) {
    return `${minutes} dk önce`;
  }

  const hours = Math.floor(minutes / 60);

  if (hours < 24) {
    return `${hours} saat önce`;
  }

  const days = Math.floor(hours / 24);

  if (days < 7) {
    return `${days} gün önce`;
  }

  return createdAt.toLocaleDateString("tr-TR");
}

function Header() {
  const location = useLocation();

  const dropdownRef = useRef<HTMLDivElement | null>(null);

  const [alerts, setAlerts] = useState<Alert[]>([]);

  const [unreadCount, setUnreadCount] = useState(0);

  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const [loading, setLoading] = useState(false);

  const [error, setError] = useState("");

  const currentPage = pageInfo[location.pathname] ?? {
    title: "Akıllı Trafik",
    description: "Akıllı Trafik Yönetim Sistemi",
  };

  const loadAlerts = useCallback(async (showLoading = false) => {
    if (showLoading) {
      setLoading(true);
    }

    try {
      const response = await api.get<AlertsResponse>("/alerts", {
        params: {
          per_page: 10,
        },
      });

      setAlerts(response.data.data);

      setUnreadCount(response.data.unread_count);

      setError("");
    } catch (error) {
      console.error("BİLDİRİMLER ALINAMADI:", error);

      setError("Bildirimler alınamadı.");
    } finally {
      if (showLoading) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    void loadAlerts();

    const intervalId = window.setInterval(() => {
      void loadAlerts();
    }, 30_000);

    return () => {
      window.clearInterval(intervalId);
    };
  }, [loadAlerts]);

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setNotificationsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);

    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, []);

  useEffect(() => {
    setNotificationsOpen(false);
  }, [location.pathname]);

  const toggleNotifications = async () => {
    const nextState = !notificationsOpen;

    setNotificationsOpen(nextState);

    if (nextState) {
      await loadAlerts(true);
    }
  };

  const markAsRead = async (alert: Alert) => {
    if (alert.is_read) {
      return;
    }

    try {
      await api.patch(`/alerts/${alert.id}/read`);

      setAlerts((currentAlerts) =>
        currentAlerts.map((currentAlert) =>
          currentAlert.id === alert.id
            ? {
                ...currentAlert,
                is_read: true,
                read_at: new Date().toISOString(),
              }
            : currentAlert,
        ),
      );

      setUnreadCount((current) => Math.max(current - 1, 0));
    } catch (error) {
      console.error("BİLDİRİM OKUNAMADI:", error);
    }
  };

  const markAllAsRead = async () => {
    if (unreadCount === 0) {
      return;
    }

    try {
      await api.patch("/alerts/read-all");

      const now = new Date().toISOString();

      setAlerts((currentAlerts) =>
        currentAlerts.map((alert) => ({
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

  return (
    <header className="app-header">
      <div className="header-page-info">
        <h2>{currentPage.title}</h2>

        <p>{currentPage.description}</p>
      </div>

      <div className="header-actions">
        <div className="notification-wrapper" ref={dropdownRef}>
          <button
            type="button"
            className={`notification-button ${
              notificationsOpen ? "active" : ""
            }`}
            aria-label="Bildirimler"
            aria-expanded={notificationsOpen}
            onClick={toggleNotifications}
          >
            <Bell size={20} />

            {unreadCount > 0 && (
              <span className="notification-count">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>

          {notificationsOpen && (
            <div className="notification-dropdown">
              <div className="notification-dropdown-header">
                <div>
                  <h3>Bildirimler</h3>

                  <span>
                    {unreadCount > 0
                      ? `${unreadCount} okunmamış bildirim`
                      : "Yeni bildirim yok"}
                  </span>
                </div>

                <button
                  type="button"
                  className="notification-close-button"
                  onClick={() => setNotificationsOpen(false)}
                  aria-label="Bildirimleri kapat"
                >
                  <X size={17} />
                </button>
              </div>

              {unreadCount > 0 && (
                <button
                  type="button"
                  className="mark-all-read-button"
                  onClick={markAllAsRead}
                >
                  <CheckCheck size={15} />
                  Tümünü okundu olarak işaretle
                </button>
              )}

              <div className="notification-list">
                {loading ? (
                  <div className="notification-state">
                    Bildirimler yükleniyor...
                  </div>
                ) : error ? (
                  <div className="notification-state error">{error}</div>
                ) : alerts.length === 0 ? (
                  <div className="notification-empty">
                    <Bell size={28} />

                    <strong>Bildirim yok</strong>

                    <span>Yeni trafik uyarıları burada görünecek.</span>
                  </div>
                ) : (
                  alerts.map((alert) => (
                    <button
                      type="button"
                      key={alert.id}
                      className={`notification-item ${
                        !alert.is_read ? "unread" : ""
                      }`}
                      onClick={() => void markAsRead(alert)}
                    >
                      <div
                        className={`notification-severity-icon ${alert.severity}`}
                      >
                        <CircleAlert size={17} />
                      </div>

                      <div className="notification-content">
                        <div className="notification-title-row">
                          <strong>{alert.title}</strong>

                          {!alert.is_read && <span className="unread-dot" />}
                        </div>

                        <p>{alert.message}</p>

                        <div className="notification-meta">
                          <span
                            className={`notification-severity ${alert.severity}`}
                          >
                            {getSeverityLabel(alert.severity)}
                          </span>

                          <span>{getRelativeTime(alert.created_at)}</span>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>

              <Link
                to="/alerts"
                className="notification-view-all"
                onClick={() => setNotificationsOpen(false)}
              >
                Tüm Bildirimleri Gör
              </Link>
            </div>
          )}
        </div>

        <div className="header-profile">
          <div className="profile-avatar">Y</div>

          <div className="profile-info">
            <strong>Yönetici</strong>

            <span>Sistem Yöneticisi</span>
          </div>
        </div>
      </div>
    </header>
  );
}

export default Header;
