import { useEffect, useState } from "react";

import type { FormEvent } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import TrafficEventModal from "../components/TrafficEventModal";

import ConfirmModal from "../components/ui/ConfirmModal";
import Loading from "../components/ui/Loading";

import useToast from "../hooks/useToast";

import api from "../services/api";

import type { Camera } from "../types/camera";

import type {
  TrafficEvent,
  TrafficEventsResponse,
} from "../types/trafficEvent";

function formatType(value: string) {
  const types: Record<string, string> = {
    ACCIDENT: "Kaza",

    ROAD_WORK: "Yol Çalışması",

    VEHICLE_BREAKDOWN: "Araç Arızası",

    ROAD_CLOSED: "Yol Kapalı",

    TRAFFIC_JAM: "Trafik Yoğunluğu",
  };

  return types[value] ?? value;
}

function formatSeverity(value: string) {
  const severities: Record<string, string> = {
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
    critical: "Kritik",
  };

  return severities[value] ?? value;
}

function formatStatus(value: string) {
  const statuses: Record<string, string> = {
    active: "Aktif",
    resolved: "Çözüldü",
  };

  return statuses[value] ?? value;
}

function TrafficEvents() {
  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);

  const [cameras, setCameras] = useState<Camera[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [severity, setSeverity] = useState("");

  const [type, setType] = useState("");

  const [cameraId, setCameraId] = useState("");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [perPage, setPerPage] = useState(10);

  const [sortBy, setSortBy] = useState("occurred_at");

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedTrafficEvent, setSelectedTrafficEvent] =
    useState<TrafficEvent | null>(null);

  const [trafficEventToDelete, setTrafficEventToDelete] =
    useState<TrafficEvent | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const loadCameras = async () => {
      try {
        const response = await api.get("/cameras", {
          params: {
            per_page: 100,
            sort_by: "name",
            sort_direction: "asc",
          },
        });

        if (cancelled) {
          return;
        }

        setCameras(response.data.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("KAMERA YÜKLEME HATASI:", error);

        showToast("Kamera listesi alınamadı.", "error");
      }
    };

    void loadCameras();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;

    const loadTrafficEvents = async () => {
      try {
        const response = await api.get<TrafficEventsResponse>(
          "/traffic-events",
          {
            params: {
              search: search || undefined,

              status: status || undefined,

              severity: severity || undefined,

              type: type || undefined,

              camera_id: cameraId ? Number(cameraId) : undefined,

              date_from: dateFrom || undefined,

              date_to: dateTo || undefined,

              page,

              per_page: perPage,

              sort_by: sortBy,

              sort_direction: sortDirection,
            },
          },
        );

        if (cancelled) {
          return;
        }

        setTrafficEvents(response.data.data);

        setLastPage(response.data.meta.last_page);

        setTotal(response.data.meta.total);

        setError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("TRAFİK OLAYLARI YÜKLEME HATASI:", error);

        setError("Trafik olayları alınamadı.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadTrafficEvents();

    return () => {
      cancelled = true;
    };
  }, [
    search,
    status,
    severity,
    type,
    cameraId,
    dateFrom,
    dateTo,
    page,
    perPage,
    sortBy,
    sortDirection,
    refreshKey,
  ]);

  const startLoading = () => {
    setLoading(true);
    setError("");
  };

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    startLoading();

    setPage(1);

    setSearch(searchInput.trim());
  };

  const handleClearFilters = () => {
    startLoading();

    setSearchInput("");
    setSearch("");
    setStatus("");
    setSeverity("");
    setType("");
    setCameraId("");
    setDateFrom("");
    setDateTo("");

    setPage(1);

    setRefreshKey((current) => current + 1);
  };

  const handleCreate = () => {
    setSelectedTrafficEvent(null);

    setModalOpen(true);
  };

  const handleEdit = (trafficEvent: TrafficEvent) => {
    setSelectedTrafficEvent(trafficEvent);

    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedTrafficEvent(null);

    setModalOpen(false);
  };

  const handleSaved = () => {
    startLoading();

    setRefreshKey((current) => current + 1);
  };

  const handleDelete = async (trafficEvent: TrafficEvent) => {
    try {
      setDeletingId(trafficEvent.id);

      await api.delete(`/traffic-events/${trafficEvent.id}`);

      setTrafficEventToDelete(null);

      showToast(`"${trafficEvent.title}" trafik olayı silindi.`, "success");

      startLoading();

      if (trafficEvents.length === 1 && page > 1) {
        setPage((current) => current - 1);

        return;
      }

      setRefreshKey((current) => current + 1);
    } catch (error) {
      console.error(error);

      showToast("Trafik olayı silinemedi.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const hasFilters =
    search || status || severity || type || cameraId || dateFrom || dateTo;

  return (
    <div className="vehicles-page">
      <div className="page-heading">
        <div>
          <h1>Trafik Olayları</h1>

          <p>Trafik olaylarını görüntüleyin, filtreleyin ve yönetin.</p>
        </div>

        <button type="button" className="primary-button" onClick={handleCreate}>
          <Plus size={18} />
          Yeni Olay
        </button>
      </div>

      <div className="violation-search-row">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search size={18} />

            <input
              type="text"
              placeholder="Başlık, açıklama veya kamera ara..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <button type="submit" className="search-button">
            Ara
          </button>
        </form>
      </div>

      <div className="traffic-event-filters">
        <select
          value={status}
          onChange={(event) => {
            startLoading();

            setPage(1);

            setStatus(event.target.value);
          }}
        >
          <option value="">Tüm Durumlar</option>

          <option value="active">Aktif</option>

          <option value="resolved">Çözüldü</option>
        </select>

        <select
          value={severity}
          onChange={(event) => {
            startLoading();

            setPage(1);

            setSeverity(event.target.value);
          }}
        >
          <option value="">Tüm Seviyeler</option>

          <option value="low">Düşük</option>

          <option value="medium">Orta</option>

          <option value="high">Yüksek</option>

          <option value="critical">Kritik</option>
        </select>

        <select
          value={type}
          onChange={(event) => {
            startLoading();

            setPage(1);

            setType(event.target.value);
          }}
        >
          <option value="">Tüm Olay Türleri</option>

          <option value="ACCIDENT">Kaza</option>

          <option value="ROAD_WORK">Yol Çalışması</option>

          <option value="VEHICLE_BREAKDOWN">Araç Arızası</option>

          <option value="ROAD_CLOSED">Yol Kapalı</option>

          <option value="TRAFFIC_JAM">Trafik Yoğunluğu</option>
        </select>

        <select
          value={cameraId}
          onChange={(event) => {
            startLoading();

            setPage(1);

            setCameraId(event.target.value);
          }}
        >
          <option value="">Tüm Kameralar</option>

          {cameras.map((camera) => (
            <option key={camera.id} value={camera.id}>
              {camera.code}
              {" - "}
              {camera.name}
            </option>
          ))}
        </select>

        <input
          type="date"
          value={dateFrom}
          onChange={(event) => {
            startLoading();

            setPage(1);

            setDateFrom(event.target.value);
          }}
        />

        <input
          type="date"
          value={dateTo}
          min={dateFrom || undefined}
          onChange={(event) => {
            startLoading();

            setPage(1);

            setDateTo(event.target.value);
          }}
        />
      </div>

      <div className="violation-secondary-filters">
        <div>
          {hasFilters && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClearFilters}
            >
              Filtreleri Temizle
            </button>
          )}
        </div>

        <div className="vehicle-filters">
          <select
            value={sortBy}
            onChange={(event) => {
              startLoading();

              setPage(1);

              setSortBy(event.target.value);
            }}
          >
            <option value="occurred_at">Olay Tarihi</option>

            <option value="created_at">Kayıt Tarihi</option>

            <option value="severity">Önem Seviyesi</option>

            <option value="type">Olay Türü</option>

            <option value="id">ID</option>
          </select>

          <select
            value={sortDirection}
            onChange={(event) => {
              startLoading();

              setPage(1);

              setSortDirection(event.target.value as "asc" | "desc");
            }}
          >
            <option value="desc">Azalan</option>

            <option value="asc">Artan</option>
          </select>

          <select
            value={perPage}
            onChange={(event) => {
              startLoading();

              setPage(1);

              setPerPage(Number(event.target.value));
            }}
          >
            <option value={5}>5</option>

            <option value={10}>10</option>

            <option value={15}>15</option>

            <option value={25}>25</option>

            <option value={50}>50</option>
          </select>
        </div>
      </div>

      <div className="vehicles-card">
        {loading && <Loading text="Trafik olayları yükleniyor..." />}

        {!loading && error && (
          <div className="table-state error-message">{error}</div>
        )}

        {!loading && !error && trafficEvents.length === 0 && (
          <div className="table-state">Trafik olayı bulunamadı.</div>
        )}

        {!loading && !error && trafficEvents.length > 0 && (
          <>
            <div className="table-wrapper">
              <table className="violations-management-table">
                <thead>
                  <tr>
                    <th>ID</th>

                    <th>Başlık</th>

                    <th>Tür</th>

                    <th>Kamera</th>

                    <th>Seviye</th>

                    <th>Durum</th>

                    <th>Konum</th>

                    <th>Olay Tarihi</th>

                    <th>İşlemler</th>
                  </tr>
                </thead>

                <tbody>
                  {trafficEvents.map((trafficEvent) => (
                    <tr key={trafficEvent.id}>
                      <td>#{trafficEvent.id}</td>

                      <td>
                        <strong>{trafficEvent.title}</strong>
                      </td>

                      <td>{formatType(trafficEvent.type)}</td>

                      <td>{trafficEvent.camera?.code ?? "-"}</td>

                      <td>
                        <span
                          className={`severity-badge ${trafficEvent.severity}`}
                        >
                          {formatSeverity(trafficEvent.severity)}
                        </span>
                      </td>

                      <td>
                        <span
                          className={`event-status-badge ${trafficEvent.status}`}
                        >
                          {formatStatus(trafficEvent.status)}
                        </span>
                      </td>

                      <td>
                        {trafficEvent.latitude}, {trafficEvent.longitude}
                      </td>

                      <td>
                        {new Date(trafficEvent.occurred_at).toLocaleString(
                          "tr-TR",
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="table-action-button"
                            onClick={() => handleEdit(trafficEvent)}
                          >
                            <Pencil size={15} />
                            Düzenle
                          </button>

                          <button
                            type="button"
                            className="table-delete-button"
                            onClick={() =>
                              setTrafficEventToDelete(trafficEvent)
                            }
                          >
                            <Trash2 size={15} />
                            Sil
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="pagination">
              <div className="pagination-info">
                Toplam <strong>{total}</strong> trafik olayı
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => {
                    startLoading();

                    setPage((current) => Math.max(current - 1, 1));
                  }}
                >
                  <ChevronLeft size={17} />
                </button>

                <span>
                  Sayfa <strong>{page}</strong> / {lastPage}
                </span>

                <button
                  type="button"
                  disabled={page === lastPage}
                  onClick={() => {
                    startLoading();

                    setPage((current) => Math.min(current + 1, lastPage));
                  }}
                >
                  <ChevronRight size={17} />
                </button>
              </div>
            </div>
          </>
        )}
      </div>

      {modalOpen && (
        <TrafficEventModal
          key={
            selectedTrafficEvent
              ? `traffic-event-${selectedTrafficEvent.id}`
              : "traffic-event-create"
          }
          trafficEvent={selectedTrafficEvent}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}

      {trafficEventToDelete && (
        <ConfirmModal
          open={true}
          title="Trafik Olayını Sil"
          message={`"${trafficEventToDelete.title}" trafik olayını silmek istediğinize emin misiniz?`}
          confirmText="Olayı Sil"
          loading={deletingId === trafficEventToDelete.id}
          onCancel={() => setTrafficEventToDelete(null)}
          onConfirm={() => void handleDelete(trafficEventToDelete)}
        />
      )}
    </div>
  );
}

export default TrafficEvents;
