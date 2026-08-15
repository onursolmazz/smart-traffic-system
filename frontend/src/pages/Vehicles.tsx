import { useCallback, useEffect, useState } from "react";

import type { FormEvent } from "react";

import {
  ChevronLeft,
  ChevronRight,
  Pencil,
  Plus,
  Search,
  Trash2,
} from "lucide-react";

import api from "../services/api";
import VehicleModal from "../components/VehicleModal";

import type { Vehicle, VehiclesResponse } from "../types/vehicle";

function Vehicles() {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");

  const [page, setPage] = useState(1);
  const [lastPage, setLastPage] = useState(1);
  const [total, setTotal] = useState(0);

  const [perPage, setPerPage] = useState(10);

  const [sortBy, setSortBy] = useState("created_at");

  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  const [modalOpen, setModalOpen] = useState(false);

  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);

  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchVehicles = useCallback(async () => {
    try {
      const response = await api.get<VehiclesResponse>("/vehicles", {
        params: {
          search: search || undefined,
          page,
          per_page: perPage,
          sort_by: sortBy,
          sort_direction: sortDirection,
        },
      });

      setVehicles(response.data.data);
      setLastPage(response.data.meta.last_page);
      setTotal(response.data.meta.total);
      setError("");
    } catch (error) {
      console.error(error);

      setError("Araçlar alınamadı.");
    } finally {
      setLoading(false);
    }
  }, [search, page, perPage, sortBy, sortDirection]);

  useEffect(() => {
    fetchVehicles();
  }, [fetchVehicles]);

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

  const handleClearSearch = () => {
    startLoading();

    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleOpenCreateModal = () => {
    setSelectedVehicle(null);
    setModalOpen(true);
  };

  const handleOpenEditModal = (vehicle: Vehicle) => {
    setSelectedVehicle(vehicle);
    setModalOpen(true);
  };

  const handleCloseModal = () => {
    setModalOpen(false);
    setSelectedVehicle(null);
  };

  const handleVehicleSaved = async () => {
    startLoading();

    await fetchVehicles();
  };

  const handleDelete = async (vehicle: Vehicle) => {
    const confirmed = window.confirm(
      `${vehicle.plate} plakalı aracı silmek istediğinize emin misiniz?`,
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(vehicle.id);

      await api.delete(`/vehicles/${vehicle.id}`);

      if (vehicles.length === 1 && page > 1) {
        startLoading();

        setPage((currentPage) => currentPage - 1);

        return;
      }

      startLoading();

      await fetchVehicles();
    } catch (error) {
      console.error(error);

      window.alert("Araç silinirken bir hata oluştu.");
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="vehicles-page">
      <div className="page-heading">
        <div>
          <h1>Vehicles</h1>

          <p>Sistemde kayıtlı araçları görüntüleyin ve yönetin.</p>
        </div>

        <button
          type="button"
          className="primary-button"
          onClick={handleOpenCreateModal}
        >
          <Plus size={18} />
          Yeni Araç
        </button>
      </div>

      <div className="vehicles-toolbar">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <Search size={18} />

            <input
              type="text"
              placeholder="Plaka, marka, model veya renk ara..."
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
            />
          </div>

          <button type="submit" className="search-button">
            Ara
          </button>

          {search && (
            <button
              type="button"
              className="clear-button"
              onClick={handleClearSearch}
            >
              Temizle
            </button>
          )}
        </form>

        <div className="vehicle-filters">
          <select
            value={sortBy}
            onChange={(event) => {
              startLoading();

              setPage(1);
              setSortBy(event.target.value);
            }}
          >
            <option value="created_at">Eklenme Tarihi</option>

            <option value="plate">Plaka</option>

            <option value="brand">Marka</option>

            <option value="model">Model</option>

            <option value="year">Yıl</option>
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
        {loading && <div className="table-state">Araçlar yükleniyor...</div>}

        {!loading && error && (
          <div className="table-state error-message">{error}</div>
        )}

        {!loading && !error && vehicles.length === 0 && (
          <div className="table-state">Araç bulunamadı.</div>
        )}

        {!loading && !error && vehicles.length > 0 && (
          <>
            <div className="table-wrapper">
              <table className="vehicles-table">
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Plaka</th>
                    <th>Marka</th>
                    <th>Model</th>
                    <th>Renk</th>
                    <th>Yıl</th>
                    <th>Kayıt Tarihi</th>
                    <th>İşlemler</th>
                  </tr>
                </thead>

                <tbody>
                  {vehicles.map((vehicle) => (
                    <tr key={vehicle.id}>
                      <td>#{vehicle.id}</td>

                      <td>
                        <span className="plate-badge">{vehicle.plate}</span>
                      </td>

                      <td>{vehicle.brand ?? "-"}</td>

                      <td>{vehicle.model ?? "-"}</td>

                      <td>{vehicle.color ?? "-"}</td>

                      <td>{vehicle.year ?? "-"}</td>

                      <td>
                        {new Date(vehicle.created_at).toLocaleDateString(
                          "tr-TR",
                        )}
                      </td>

                      <td>
                        <div className="table-actions">
                          <button
                            type="button"
                            className="table-action-button"
                            onClick={() => handleOpenEditModal(vehicle)}
                          >
                            <Pencil size={15} />
                            Düzenle
                          </button>

                          <button
                            type="button"
                            className="table-delete-button"
                            onClick={() => handleDelete(vehicle)}
                            disabled={deletingId === vehicle.id}
                          >
                            <Trash2 size={15} />

                            {deletingId === vehicle.id ? "Siliniyor..." : "Sil"}
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
                Toplam <strong>{total}</strong> araç
              </div>

              <div className="pagination-controls">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => {
                    startLoading();

                    setPage((currentPage) => Math.max(currentPage - 1, 1));
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

                    setPage((currentPage) =>
                      Math.min(currentPage + 1, lastPage),
                    );
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
        <VehicleModal
          key={selectedVehicle ? `edit-${selectedVehicle.id}` : "create"}
          vehicle={selectedVehicle}
          onClose={handleCloseModal}
          onSaved={handleVehicleSaved}
        />
      )}
    </div>
  );
}

export default Vehicles;
