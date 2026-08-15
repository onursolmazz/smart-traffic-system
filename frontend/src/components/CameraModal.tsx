import { useState } from "react";

import type { ChangeEvent, FormEvent } from "react";

import axios from "axios";

import { X } from "lucide-react";

import api from "../services/api";

import useToast from "../hooks/useToast";

import type { Camera, CameraFormData } from "../types/camera";

interface CameraModalProps {
  camera: Camera | null;
  onClose: () => void;
  onSaved: () => void;
}

function getInitialForm(camera: Camera | null): CameraFormData {
  if (camera) {
    return {
      name: camera.name,
      code: camera.code,
      latitude: camera.latitude,
      longitude: camera.longitude,
      status: camera.status,
      speed_limit: camera.speed_limit?.toString() ?? "",
    };
  }

  return {
    name: "",
    code: "",
    latitude: "",
    longitude: "",
    status: "active",
    speed_limit: "",
  };
}

function CameraModal({ camera, onClose, onSaved }: CameraModalProps) {
  const [form, setForm] = useState<CameraFormData>(() =>
    getInitialForm(camera),
  );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const { showToast } = useToast();

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    setError("");
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    setForm((current) => ({
      ...current,

      status: event.target.value as "active" | "inactive" | "maintenance",
    }));

    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        name: form.name.trim(),

        code: form.code.trim().toUpperCase(),

        latitude: Number(form.latitude),

        longitude: Number(form.longitude),

        status: form.status,

        speed_limit: form.speed_limit === "" ? null : Number(form.speed_limit),
      };

      if (camera) {
        await api.patch(`/cameras/${camera.id}`, payload);
      } else {
        await api.post("/cameras", payload);
      }

      showToast(
        camera ? "Kamera başarıyla güncellendi." : "Kamera başarıyla eklendi.",
        "success",
      );

      onSaved();
      onClose();
    } catch (error) {
      console.error("KAMERA KAYDETME HATASI:", error);

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

      setError(camera ? "Kamera güncellenemedi." : "Kamera oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="vehicle-modal">
        <div className="modal-header">
          <div>
            <h2>{camera ? "Kamerayı Düzenle" : "Yeni Kamera"}</h2>

            <p>
              {camera
                ? "Kamera bilgilerini güncelleyin."
                : "Sisteme yeni bir kamera ekleyin."}
            </p>
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

          <div className="form-group">
            <label htmlFor="name">Kamera Adı *</label>

            <input
              id="name"
              name="name"
              type="text"
              value={form.name}
              onChange={handleInputChange}
              placeholder="Kızılay Kamera 01"
              required
            />
          </div>

          <div className="form-group">
            <label htmlFor="code">Kamera Kodu *</label>

            <input
              id="code"
              name="code"
              type="text"
              value={form.code}
              onChange={handleInputChange}
              placeholder="CAM-KZL-001"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="latitude">Enlem *</label>

              <input
                id="latitude"
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                onChange={handleInputChange}
                placeholder="39.9208"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="longitude">Boylam *</label>

              <input
                id="longitude"
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                onChange={handleInputChange}
                placeholder="32.8541"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="status">Durum *</label>

              <select
                id="status"
                value={form.status}
                onChange={handleStatusChange}
              >
                <option value="active">Aktif</option>

                <option value="inactive">Pasif</option>

                <option value="maintenance">Bakımda</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="speed_limit">Hız Limiti</label>

              <input
                id="speed_limit"
                name="speed_limit"
                type="number"
                min="1"
                max="300"
                value={form.speed_limit}
                onChange={handleInputChange}
                placeholder="70"
              />
            </div>
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
              {saving ? "Kaydediliyor..." : camera ? "Güncelle" : "Kamera Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CameraModal;
