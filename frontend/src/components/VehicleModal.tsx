import { useState } from "react";
import type { ChangeEvent, FormEvent } from "react";

import axios from "axios";
import { X } from "lucide-react";

import api from "../services/api";

import type { Vehicle, VehicleFormData } from "../types/vehicle";

interface VehicleModalProps {
  vehicle: Vehicle | null;
  onClose: () => void;
  onSaved: () => void;
}

function getInitialForm(vehicle: Vehicle | null): VehicleFormData {
  if (vehicle) {
    return {
      plate: vehicle.plate,
      brand: vehicle.brand ?? "",
      model: vehicle.model ?? "",
      color: vehicle.color ?? "",
      year: vehicle.year?.toString() ?? "",
    };
  }

  return {
    plate: "",
    brand: "",
    model: "",
    color: "",
    year: "",
  };
}

function VehicleModal({ vehicle, onClose, onSaved }: VehicleModalProps) {
  const [form, setForm] = useState<VehicleFormData>(() =>
    getInitialForm(vehicle),
  );

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    try {
      setSaving(true);
      setError("");

      const payload = {
        plate: form.plate.trim().toUpperCase(),

        brand: form.brand.trim() || null,

        model: form.model.trim() || null,

        color: form.color.trim() || null,

        year: form.year === "" ? null : Number(form.year),
      };

      if (vehicle) {
        await api.patch(`/vehicles/${vehicle.id}`, payload);
      } else {
        await api.post("/vehicles", payload);
      }

      await onSaved();

      onClose();
    } catch (error) {
      console.error("VEHICLE SAVE ERROR:", error);

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

      setError(vehicle ? "Araç güncellenemedi." : "Araç oluşturulamadı.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="vehicle-modal">
        <div className="modal-header">
          <div>
            <h2>{vehicle ? "Aracı Düzenle" : "Yeni Araç"}</h2>

            <p>
              {vehicle
                ? "Araç bilgilerini güncelleyin."
                : "Sisteme yeni bir araç ekleyin."}
            </p>
          </div>

          <button
            type="button"
            className="modal-close-button"
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>

        <form className="vehicle-form" onSubmit={handleSubmit}>
          {error && <div className="form-error">{error}</div>}

          <div className="form-group">
            <label htmlFor="plate">Plaka *</label>

            <input
              id="plate"
              name="plate"
              type="text"
              value={form.plate}
              onChange={handleChange}
              placeholder="34 ABC 123"
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="brand">Marka</label>

              <input
                id="brand"
                name="brand"
                type="text"
                value={form.brand}
                onChange={handleChange}
                placeholder="Toyota"
              />
            </div>

            <div className="form-group">
              <label htmlFor="model">Model</label>

              <input
                id="model"
                name="model"
                type="text"
                value={form.model}
                onChange={handleChange}
                placeholder="Corolla"
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label htmlFor="color">Renk</label>

              <input
                id="color"
                name="color"
                type="text"
                value={form.color}
                onChange={handleChange}
                placeholder="White"
              />
            </div>

            <div className="form-group">
              <label htmlFor="year">Yıl</label>

              <input
                id="year"
                name="year"
                type="number"
                min="1900"
                max="2100"
                value={form.year}
                onChange={handleChange}
                placeholder="2024"
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
              {saving ? "Kaydediliyor..." : vehicle ? "Güncelle" : "Araç Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default VehicleModal;
