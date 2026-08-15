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

import ViolationModal from "../components/ViolationModal";

import ConfirmModal from "../components/ui/ConfirmModal";
import Loading from "../components/ui/Loading";

import useToast from "../hooks/useToast";

import api from "../services/api";

import type {
  Violation,
  ViolationsResponse,
  ViolationType,
} from "../types/violation";

import type { Vehicle } from "../types/vehicle";

import type { Camera } from "../types/camera";

function getViolationStatusLabel(status: string) {
  const labels: Record<string, string> = {
    detected: "Tespit Edildi",
    reviewed: "İncelendi",
    approved: "Onaylandı",
  };

  return labels[status] ?? status;
}

function Violations() {
  const [violations, setViolations] = useState<Violation[]>([]);

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [cameras, setCameras] = useState<Camera[]>([]);

  const [violationTypes, setViolationTypes] = useState<ViolationType[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [type, setType] = useState("");

  const [cameraId, setCameraId] = useState("");

  const [vehicleId, setVehicleId] = useState("");

  const [dateFrom, setDateFrom] = useState("");

  const [dateTo, setDateTo] = useState("");

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [perPage, setPerPage] = useState(10);

  const [sortBy, setSortBy] = useState("detected_at");

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedViolation, setSelectedViolation] = useState<Violation | null>(
    null,
  );

  const [violationToDelete, setViolationToDelete] = useState<Violation | null>(
    null,
  );

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const loadFilterOptions = async () => {
      try {
        const [vehiclesResponse, camerasResponse, typesResponse] =
          await Promise.all([
            api.get("/vehicles", {
              params: {
                per_page: 100,
                sort_by: "plate",
                sort_direction: "asc",
              },
            }),

            api.get("/cameras", {
              params: {
                per_page: 100,
                sort_by: "name",
                sort_direction: "asc",
              },
            }),

            api.get("/violation-types"),
          ]);

        if (cancelled) {
          return;
        }

        setVehicles(vehiclesResponse.data.data);

        setCameras(camerasResponse.data.data);

        setViolationTypes(typesResponse.data.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("FİLTRE SEÇENEKLERİ HATASI:", error);

        showToast("Filtre seçenekleri alınamadı.", "error");
      }
    };

    void loadFilterOptions();

    return () => {
      cancelled = true;
    };
  }, [showToast]);

  useEffect(() => {
    let cancelled = false;

    const loadViolations = async () => {
      try {
        const response = await api.get<ViolationsResponse>("/violations", {
          params: {
            search: search || undefined,

            status: status || undefined,

            type: type || undefined,

            camera_id: cameraId ? Number(cameraId) : undefined,

            vehicle_id: vehicleId ? Number(vehicleId) : undefined,

            date_from: dateFrom || undefined,

            date_to: dateTo || undefined,

            page,

            per_page: perPage,

            sort_by: sortBy,

            sort_direction: sortDirection,
          },
        });

        if (cancelled) {
          return;
        }

        setViolations(response.data.data);

        setLastPage(response.data.meta.last_page);

        setTotal(response.data.meta.total);

        setError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("İHLALLER YÜKLEME HATASI:", error);

        setError("İhlaller alınamadı.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadViolations();

    return () => {
      cancelled = true;
    };
  }, [
    search,
    status,
    type,
    cameraId,
    vehicleId,
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
    setType("");
    setCameraId("");
    setVehicleId("");
    setDateFrom("");
    setDateTo("");

    setPage(1);

    setRefreshKey((current) => current + 1);
  };

  const handleCreate = () => {
    setSelectedViolation(null);

    setModalOpen(true);
  };

  const handleEdit = (violation: Violation) => {
    setSelectedViolation(violation);

    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedViolation(null);

    setModalOpen(false);
  };

  const handleSaved = () => {
    startLoading();

    setRefreshKey((current) => current + 1);
  };

  const handleDelete = async (violation: Violation) => {
    try {
      setDeletingId(violation.id);

      await api.delete(`/violations/${violation.id}`);

      setViolationToDelete(null);

      showToast(`#${violation.id} numaralı ihlal silindi.`, "success");

      startLoading();

      if (violations.length === 1 && page > 1) {
        setPage((current) => current - 1);

        return;
      }

      setRefreshKey((current) => current + 1);
    } catch (error) {
      console.error(error);

      showToast("İhlal silinemedi.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  const hasFilters =
    search || status || type || cameraId || vehicleId || dateFrom || dateTo;

  return (
    <div className="vehicles-page">
      <div className="page-heading">
        <div>
          <h1>İhlaller</h1>

          <p>Trafik ihlallerini görüntüleyin, filtreleyin ve yönetin.</p>
        </div>

        <button type="button" className="primary-button" onClick={handleCreate}>
          <Plus size={18} />
          Yeni İhlal
        </button>
      </div>

      <div className="violation-search-row">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search size={18} />

            <input
              type="text"
              placeholder="Plaka, kamera adı veya kodu ara..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <button type="submit" className="search-button">
            Ara
          </button>
        </form>
      </div>

      <div className="violation-filters">
        <select
          value={status}
          onChange={(event) => {
            startLoading();

            setPage(1);

            setStatus(event.target.value);
          }}
        >
          <option value="">Tüm Durumlar</option>

          <option value="detected">Tespit Edildi</option>

          <option value="reviewed">İncelendi</option>

          <option value="approved">Onaylandı</option>
        </select>

        <select
          value={type}
          onChange={(event) => {
            startLoading();

            setPage(1);

            setType(event.target.value);
          }}
        >
          <option value="">Tüm İhlal Türleri</option>

          {violationTypes.map((violationType) => (
            <option key={violationType.id} value={violationType.code}>
              {violationType.name}
            </option>
          ))}
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

        <select
          value={vehicleId}
          onChange={(event) => {
            startLoading();

            setPage(1);

            setVehicleId(event.target.value);
          }}
        >
          <option value="">Tüm Araçlar</option>

          {vehicles.map((vehicle) => (
            <option key={vehicle.id} value={vehicle.id}>
              {vehicle.plate}
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
            <option value="detected_at">Tespit Tarihi</option>

            <option value="created_at">Kayıt Tarihi</option>

            <option value="speed">Hız</option>

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
        {loading && <Loading text="İhlaller yükleniyor..." />}

        {!loading && error && (
          <div className="table-state error-message">{error}</div>
        )}

        {!loading && !error && violations.length === 0 && (
          <div className="table-state">İhlal bulunamadı.</div>
        )}

        {!loading && !error && violations.length > 0 && (
          <>
            <div className="table-wrapper">
              <table className="violations-management-table">
                <thead>
                  <tr>
                    <th>ID</th>

                    <th>Plaka</th>

                    <th>İhlal Türü</th>

                    <th>Kamera</th>

                    <th>Hız</th>

                    <th>Limit</th>

                    <th>Durum</th>

                    <th>Tespit Tarihi</th>

                    <th>İşlemler</th>
                  </tr>
                </thead>

                <tbody>
                  {violations.map((violation) => (
                    <tr key={violation.id}>
                      <td>#{violation.id}</td>

                      <td>
                        <span className="plate-badge">
                          {violation.vehicle?.plate ?? "-"}
                        </span>
                      </td>

                      <td>{violation.violation_type?.name ?? "-"}</td>

                      <td>{violation.camera?.code ?? "-"}</td>

                      <td>
                        {violation.speed !== null
                          ? `${violation.speed} km/h`
                          : "-"}
                      </td>

                      <td>
                        {violation.speed_limit !== null
                          ? `${violation.speed_limit} km/h`
                          : "-"}
                      </td>

                      <td>
                        <span className={`status-badge ${violation.status}`}>
                          {getViolationStatusLabel(violation.status)}
                        </span>
                      </td>

                      <td>
                        {new Date(violation.detected_at).toLocaleString(
                          "tr-TR",
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="table-action-button"
                            onClick={() => handleEdit(violation)}
                          >
                            <Pencil size={15} />
                            Düzenle
                          </button>

                          <button
                            type="button"
                            className="table-delete-button"
                            onClick={() => setViolationToDelete(violation)}
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
                Toplam <strong>{total}</strong> ihlal
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
        <ViolationModal
          key={
            selectedViolation
              ? `violation-${selectedViolation.id}`
              : "violation-create"
          }
          violation={selectedViolation}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}

      {violationToDelete && (
        <ConfirmModal
          open={true}
          title="İhlali Sil"
          message={`#${violationToDelete.id} numaralı ihlali silmek istediğinize emin misiniz?`}
          confirmText="İhlali Sil"
          loading={deletingId === violationToDelete.id}
          onCancel={() => setViolationToDelete(null)}
          onConfirm={() => void handleDelete(violationToDelete)}
        />
      )}
    </div>
  );
}

export default Violations;
