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

import CameraModal from "../components/CameraModal";

import ConfirmModal from "../components/ui/ConfirmModal";
import Loading from "../components/ui/Loading";

import useToast from "../hooks/useToast";

import api from "../services/api";

import type { Camera, CamerasResponse } from "../types/camera";

function getCameraStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "Aktif",
    inactive: "Pasif",
    maintenance: "Bakımda",
  };

  return labels[status] ?? status;
}

function Cameras() {
  const [cameras, setCameras] = useState<Camera[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState("");

  const [speedLimit, setSpeedLimit] = useState("");

  const [page, setPage] = useState(1);

  const [lastPage, setLastPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [perPage, setPerPage] = useState(10);

  const [sortBy, setSortBy] = useState("created_at");

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedCamera, setSelectedCamera] = useState<Camera | null>(null);

  const [cameraToDelete, setCameraToDelete] = useState<Camera | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const [refreshKey, setRefreshKey] = useState(0);

  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const loadCameras = async () => {
      try {
        const response = await api.get<CamerasResponse>("/cameras", {
          params: {
            search: search || undefined,

            status: status || undefined,

            speed_limit: speedLimit ? Number(speedLimit) : undefined,

            page,

            per_page: perPage,

            sort_by: sortBy,

            sort_direction: sortDirection,
          },
        });

        if (cancelled) {
          return;
        }

        setCameras(response.data.data);

        setLastPage(response.data.meta.last_page);

        setTotal(response.data.meta.total);

        setError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);

        setError("Kameralar alınamadı.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadCameras();

    return () => {
      cancelled = true;
    };
  }, [
    search,
    status,
    speedLimit,
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
    setSpeedLimit("");
    setPage(1);

    setRefreshKey((current) => current + 1);
  };

  const handleCreate = () => {
    setSelectedCamera(null);
    setModalOpen(true);
  };

  const handleEdit = (camera: Camera) => {
    setSelectedCamera(camera);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setSelectedCamera(null);
    setModalOpen(false);
  };

  const handleSaved = () => {
    startLoading();

    setRefreshKey((current) => current + 1);
  };

  const handleDelete = async (camera: Camera) => {
    try {
      setDeletingId(camera.id);

      await api.delete(`/cameras/${camera.id}`);

      setCameraToDelete(null);

      showToast(`${camera.name} kamerası silindi.`, "success");

      startLoading();

      if (cameras.length === 1 && page > 1) {
        setPage((current) => current - 1);

        return;
      }

      setRefreshKey((current) => current + 1);
    } catch (error) {
      console.error(error);

      showToast("Kamera silinemedi.", "error");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="vehicles-page">
      <div className="page-heading">
        <div>
          <h1>Kameralar</h1>

          <p>Trafik kameralarını görüntüleyin ve yönetin.</p>
        </div>

        <button type="button" className="primary-button" onClick={handleCreate}>
          <Plus size={18} />
          Yeni Kamera
        </button>
      </div>

      <div className="vehicles-toolbar">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search size={18} />

            <input
              type="text"
              placeholder="Kamera adı veya kod ara..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <button type="submit" className="search-button">
            Ara
          </button>
        </form>

        <div className="vehicle-filters">
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

            <option value="inactive">Pasif</option>

            <option value="maintenance">Bakımda</option>
          </select>

          <select
            value={speedLimit}
            onChange={(event) => {
              startLoading();
              setPage(1);

              setSpeedLimit(event.target.value);
            }}
          >
            <option value="">Tüm Hız Limitleri</option>

            <option value="30">30 km/h</option>

            <option value="50">50 km/h</option>

            <option value="70">70 km/h</option>

            <option value="90">90 km/h</option>
          </select>

          <select
            value={sortBy}
            onChange={(event) => {
              startLoading();
              setPage(1);

              setSortBy(event.target.value);
            }}
          >
            <option value="created_at">Eklenme Tarihi</option>

            <option value="name">İsim</option>

            <option value="code">Kod</option>

            <option value="speed_limit">Hız Limiti</option>
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

      {(search || status || speedLimit) && (
        <button
          type="button"
          className="clear-button camera-clear-button"
          onClick={handleClearFilters}
        >
          Filtreleri Temizle
        </button>
      )}

      <div className="vehicles-card">
        {loading && <Loading text="Kameralar yükleniyor..." />}

        {!loading && error && (
          <div className="table-state error-message">{error}</div>
        )}

        {!loading && !error && cameras.length === 0 && (
          <div className="table-state">Kamera bulunamadı.</div>
        )}

        {!loading && !error && cameras.length > 0 && (
          <>
            <div className="table-wrapper">
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>İsim</th>
                    <th>Kod</th>
                    <th>Konum</th>
                    <th>Durum</th>
                    <th>Hız Limiti</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>

                <tbody>
                  {cameras.map((camera) => (
                    <tr key={camera.id}>
                      <td>#{camera.id}</td>

                      <td>{camera.name}</td>

                      <td>
                        <span className="plate-badge">{camera.code}</span>
                      </td>

                      <td>
                        {camera.latitude}, {camera.longitude}
                      </td>

                      <td>
                        <span className={`camera-status ${camera.status}`}>
                          {getCameraStatusLabel(camera.status)}
                        </span>
                      </td>

                      <td>
                        {camera.speed_limit
                          ? `${camera.speed_limit} km/h`
                          : "-"}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="table-action-button"
                            onClick={() => handleEdit(camera)}
                          >
                            <Pencil size={15} />
                            Düzenle
                          </button>

                          <button
                            type="button"
                            className="table-delete-button"
                            onClick={() => setCameraToDelete(camera)}
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
                Toplam <strong>{total}</strong> kamera
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
        <CameraModal
          key={selectedCamera ? `camera-${selectedCamera.id}` : "camera-create"}
          camera={selectedCamera}
          onClose={handleCloseModal}
          onSaved={handleSaved}
        />
      )}

      {cameraToDelete && (
        <ConfirmModal
          open={true}
          title="Kamerayı Sil"
          message={`${cameraToDelete.name} kamerasını silmek istediğinize emin misiniz?`}
          confirmText="Kamerayı Sil"
          loading={deletingId === cameraToDelete.id}
          onCancel={() => setCameraToDelete(null)}
          onConfirm={() => void handleDelete(cameraToDelete)}
        />
      )}
    </div>
  );
}

export default Cameras;
