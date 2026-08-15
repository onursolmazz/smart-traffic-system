import { useEffect, useState } from "react";

import type { ChangeEvent, FormEvent } from "react";

import axios from "axios";

import { X } from "lucide-react";

import api from "../services/api";

import useToast from "../hooks/useToast";

import type {
  Violation,
  ViolationFormData,
  ViolationType,
} from "../types/violation";

import type { Vehicle } from "../types/vehicle";

import type { Camera } from "../types/camera";

interface ViolationModalProps {
  violation: Violation | null;
  onClose: () => void;
  onSaved: () => void;
}

function getInitialForm(violation: Violation | null): ViolationFormData {
  if (violation) {
    return {
      vehicle_id: violation.vehicle.id.toString(),

      camera_id: violation.camera.id.toString(),

      violation_type_id: violation.violation_type.id.toString(),

      speed: violation.speed?.toString() ?? "",

      speed_limit: violation.speed_limit?.toString() ?? "",

      latitude: violation.latitude ?? "",

      longitude: violation.longitude ?? "",

      status: violation.status,

      detected_at: violation.detected_at
        ? violation.detected_at.slice(0, 16)
        : "",
    };
  }

  return {
    vehicle_id: "",
    camera_id: "",
    violation_type_id: "",
    speed: "",
    speed_limit: "",
    latitude: "",
    longitude: "",
    status: "detected",
    detected_at: "",
  };
}

function ViolationModal({ violation, onClose, onSaved }: ViolationModalProps) {
  const [form, setForm] = useState<ViolationFormData>(() =>
    getInitialForm(violation),
  );

  const [vehicles, setVehicles] = useState<Vehicle[]>([]);

  const [cameras, setCameras] = useState<Camera[]>([]);

  const [types, setTypes] = useState<ViolationType[]>([]);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const { showToast } = useToast();

  useEffect(() => {
    let cancelled = false;

    const loadOptions = async () => {
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

        setTypes(typesResponse.data.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error(error);

        setError("Form seçenekleri alınamadı.");
      }
    };

    void loadOptions();

    return () => {
      cancelled = true;
    };
  }, []);

  const selectedType =
    types.find((type) => type.id === Number(form.violation_type_id)) ?? null;

  const selectedTypeCode =
    selectedType?.code ??
    (violation &&
    violation.violation_type.id.toString() === form.violation_type_id
      ? violation.violation_type.code
      : null);

  const isSpeedViolation = selectedTypeCode === "SPEED";

  const handleChange = (
    event: ChangeEvent<HTMLInputElement> | ChangeEvent<HTMLSelectElement>,
  ) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleCameraChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const cameraId = event.target.value;

    const selectedCamera = cameras.find(
      (camera) => camera.id === Number(cameraId),
    );

    if (!selectedCamera) {
      setForm((current) => ({
        ...current,

        camera_id: "",
        speed_limit: "",
        latitude: "",
        longitude: "",
      }));

      return;
    }

    setForm((current) => ({
      ...current,

      camera_id: selectedCamera.id.toString(),

      latitude: selectedCamera.latitude?.toString() ?? "",

      longitude: selectedCamera.longitude?.toString() ?? "",

      speed_limit: isSpeedViolation
        ? (selectedCamera.speed_limit?.toString() ?? "")
        : "",
    }));

    setError("");
  };

  const handleViolationTypeChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const typeId = event.target.value;

    const newType = types.find((type) => type.id === Number(typeId));

    const selectedCamera = cameras.find(
      (camera) => camera.id === Number(form.camera_id),
    );

    const speedViolation = newType?.code === "SPEED";

    setForm((current) => ({
      ...current,

      violation_type_id: typeId,

      speed: speedViolation ? current.speed : "",

      speed_limit: speedViolation
        ? (selectedCamera?.speed_limit?.toString() ?? "")
        : "",
    }));

    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    let speed: number | null = null;

    let speedLimit: number | null = null;

    if (isSpeedViolation) {
      if (form.speed === "" || form.speed_limit === "") {
        setError("Hız ihlali için araç hızı ve hız limiti gereklidir.");

        return;
      }

      speed = Number(form.speed);

      speedLimit = Number(form.speed_limit);

      if (speed <= speedLimit) {
        setError(
          `İhlal hızı ${speedLimit} km/h hız limitinden yüksek olmalıdır.`,
        );

        return;
      }
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        vehicle_id: Number(form.vehicle_id),

        camera_id: Number(form.camera_id),

        violation_type_id: Number(form.violation_type_id),

        speed,

        speed_limit: speedLimit,

        latitude: form.latitude === "" ? null : Number(form.latitude),

        longitude: form.longitude === "" ? null : Number(form.longitude),

        status: form.status,

        detected_at: form.detected_at,
      };

      if (violation) {
        await api.patch(`/violations/${violation.id}`, payload);
      } else {
        await api.post("/violations", payload);
      }

      showToast(
        violation ? "İhlal başarıyla güncellendi." : "İhlal başarıyla eklendi.",
        "success",
      );

      onSaved();
      onClose();
    } catch (error) {
      console.error("İHLAL KAYDETME HATASI:", error);

      if (axios.isAxiosError(error)) {
        if (error.response?.status === 422) {
          const errors = error.response.data?.errors;

          if (errors) {
            const firstError = Object.values(errors).flat().at(0);

            if (typeof firstError === "string") {
              setError(firstError);

              return;
            }
          }
        }

        if (error.response?.data?.message) {
          setError(error.response.data.message);

          return;
        }
      }

      setError(violation ? "İhlal güncellenemedi." : "İhlal oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="vehicle-modal violation-modal">
        <div className="modal-header">
          <div>
            <h2>{violation ? "İhlali Düzenle" : "Yeni İhlal"}</h2>

            <p>Trafik ihlal bilgilerini girin.</p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
            disabled={saving}
          >
            <X size={20} />
          </button>
        </div>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-row">
            <div className="form-group">
              <label>Araç *</label>

              <select
                name="vehicle_id"
                value={form.vehicle_id}
                onChange={handleChange}
                required
              >
                <option value="">Araç seçin</option>

                {vehicles.map((vehicle) => (
                  <option key={vehicle.id} value={vehicle.id}>
                    {vehicle.plate}
                    {" - "}
                    {vehicle.brand ?? ""}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Kamera *</label>

              <select
                name="camera_id"
                value={form.camera_id}
                onChange={handleCameraChange}
                required
              >
                <option value="">Kamera seçin</option>

                {cameras.map((camera) => (
                  <option key={camera.id} value={camera.id}>
                    {camera.code}
                    {" - "}
                    {camera.name}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>İhlal Türü *</label>

              <select
                name="violation_type_id"
                value={form.violation_type_id}
                onChange={handleViolationTypeChange}
                required
              >
                <option value="">Tür seçin</option>

                {types.map((type) => (
                  <option key={type.id} value={type.id}>
                    {type.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Durum *</label>

              <select name="status" value={form.status} onChange={handleChange}>
                <option value="detected">Tespit Edildi</option>

                <option value="reviewed">İncelendi</option>

                <option value="approved">Onaylandı</option>
              </select>
            </div>
          </div>

          {isSpeedViolation && (
            <div className="form-row">
              <div className="form-group">
                <label>İhlal Hızı *</label>

                <input
                  name="speed"
                  type="number"
                  min="0"
                  value={form.speed}
                  onChange={handleChange}
                  placeholder="105"
                  required
                />
              </div>

              <div className="form-group">
                <label>Hız Limiti</label>

                <input
                  name="speed_limit"
                  type="number"
                  value={form.speed_limit}
                  readOnly
                  placeholder="Kameradan otomatik gelir"
                />
              </div>
            </div>
          )}

          <div className="form-row">
            <div className="form-group">
              <label>Enlem</label>

              <input
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                readOnly
                placeholder="Kameradan otomatik gelir"
              />
            </div>

            <div className="form-group">
              <label>Boylam</label>

              <input
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                readOnly
                placeholder="Kameradan otomatik gelir"
              />
            </div>
          </div>

          <div className="form-group">
            <label>Tespit Tarihi *</label>

            <input
              name="detected_at"
              type="datetime-local"
              value={form.detected_at}
              onChange={handleChange}
              required
            />
          </div>

          <div className="modal-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={onClose}
              disabled={saving}
            >
              İptal
            </button>

            <button type="submit" className="primary-button" disabled={saving}>
              {saving
                ? "Kaydediliyor..."
                : violation
                  ? "Güncelle"
                  : "İhlal Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default ViolationModal;
