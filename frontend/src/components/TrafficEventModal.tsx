import { useEffect, useState } from "react";

import type { ChangeEvent, FormEvent } from "react";

import axios from "axios";

import { X } from "lucide-react";

import api from "../services/api";

import useToast from "../hooks/useToast";

import type { Camera } from "../types/camera";

import type {
  TrafficEvent,
  TrafficEventFormData,
  TrafficEventStatus,
} from "../types/trafficEvent";

interface TrafficEventModalProps {
  trafficEvent: TrafficEvent | null;

  onClose: () => void;

  onSaved: () => void;
}

function toDateTimeLocal(value: string | null): string {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  const timezoneOffset = date.getTimezoneOffset();

  const localDate = new Date(date.getTime() - timezoneOffset * 60 * 1000);

  return localDate.toISOString().slice(0, 16);
}

function getInitialForm(
  trafficEvent: TrafficEvent | null,
): TrafficEventFormData {
  if (trafficEvent) {
    return {
      camera_id: trafficEvent.camera?.id.toString() ?? "",

      type: trafficEvent.type,

      title: trafficEvent.title,

      description: trafficEvent.description ?? "",

      severity: trafficEvent.severity,

      status: trafficEvent.status,

      latitude: trafficEvent.latitude ?? "",

      longitude: trafficEvent.longitude ?? "",

      occurred_at: toDateTimeLocal(trafficEvent.occurred_at),

      resolved_at: toDateTimeLocal(trafficEvent.resolved_at),
    };
  }

  return {
    camera_id: "",
    type: "ACCIDENT",
    title: "",
    description: "",
    severity: "medium",
    status: "active",
    latitude: "",
    longitude: "",

    occurred_at: toDateTimeLocal(new Date().toISOString()),

    resolved_at: "",
  };
}

function TrafficEventModal({
  trafficEvent,
  onClose,
  onSaved,
}: TrafficEventModalProps) {
  const [form, setForm] = useState<TrafficEventFormData>(() =>
    getInitialForm(trafficEvent),
  );

  const [cameras, setCameras] = useState<Camera[]>([]);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState("");

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

        console.error(error);

        setError("Kamera listesi alınamadı.");
      }
    };

    void loadCameras();

    return () => {
      cancelled = true;
    };
  }, []);

  const handleChange = (
    event:
      | ChangeEvent<HTMLInputElement>
      | ChangeEvent<HTMLTextAreaElement>
      | ChangeEvent<HTMLSelectElement>,
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
    }));

    setError("");
  };

  const handleStatusChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const status = event.target.value as TrafficEventStatus;

    setForm((current) => ({
      ...current,

      status,

      resolved_at:
        status === "resolved"
          ? current.resolved_at || toDateTimeLocal(new Date().toISOString())
          : "",
    }));

    setError("");
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!form.camera_id) {
      setError("Lütfen bir kamera seçin.");

      return;
    }

    if (form.status === "resolved" && !form.resolved_at) {
      setError("Çözülen bir olay için çözülme tarihi gereklidir.");

      return;
    }

    if (
      form.status === "resolved" &&
      new Date(form.resolved_at) < new Date(form.occurred_at)
    ) {
      setError("Çözülme tarihi olay tarihinden önce olamaz.");

      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        camera_id: Number(form.camera_id),

        type: form.type,

        title: form.title.trim(),

        description: form.description.trim() || null,

        severity: form.severity,

        status: form.status,

        latitude: Number(form.latitude),

        longitude: Number(form.longitude),

        occurred_at: form.occurred_at,

        resolved_at: form.status === "resolved" ? form.resolved_at : null,
      };

      if (trafficEvent) {
        await api.patch(`/traffic-events/${trafficEvent.id}`, payload);
      } else {
        await api.post("/traffic-events", payload);
      }

      showToast(
        trafficEvent
          ? "Trafik olayı başarıyla güncellendi."
          : "Trafik olayı başarıyla eklendi.",
        "success",
      );

      onSaved();
      onClose();
    } catch (error) {
      console.error("TRAFİK OLAYI KAYDETME HATASI:", error);

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

      setError(
        trafficEvent
          ? "Trafik olayı güncellenemedi."
          : "Trafik olayı oluşturulamadı.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="vehicle-modal traffic-event-modal">
        <div className="modal-header">
          <div>
            <h2>
              {trafficEvent ? "Trafik Olayını Düzenle" : "Yeni Trafik Olayı"}
            </h2>

            <p>Trafik olayı bilgilerini girin.</p>
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

          <div className="form-row">
            <div className="form-group">
              <label>Olay Türü *</label>

              <select
                name="type"
                value={form.type}
                onChange={handleChange}
                required
              >
                <option value="ACCIDENT">Kaza</option>

                <option value="ROAD_WORK">Yol Çalışması</option>

                <option value="VEHICLE_BREAKDOWN">Araç Arızası</option>

                <option value="ROAD_CLOSED">Yol Kapalı</option>

                <option value="TRAFFIC_JAM">Trafik Yoğunluğu</option>
              </select>
            </div>

            <div className="form-group">
              <label>Önem Seviyesi *</label>

              <select
                name="severity"
                value={form.severity}
                onChange={handleChange}
                required
              >
                <option value="low">Düşük</option>

                <option value="medium">Orta</option>

                <option value="high">Yüksek</option>

                <option value="critical">Kritik</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label>Başlık *</label>

            <input
              name="title"
              type="text"
              value={form.title}
              onChange={handleChange}
              placeholder="Kızılay trafik kazası"
              required
            />
          </div>

          <div className="form-group">
            <label>Açıklama</label>

            <textarea
              name="description"
              value={form.description}
              onChange={handleChange}
              rows={4}
              placeholder="Olay hakkında açıklama..."
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Enlem *</label>

              <input
                name="latitude"
                type="number"
                step="any"
                value={form.latitude}
                readOnly
                required
              />
            </div>

            <div className="form-group">
              <label>Boylam *</label>

              <input
                name="longitude"
                type="number"
                step="any"
                value={form.longitude}
                readOnly
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Durum *</label>

              <select
                name="status"
                value={form.status}
                onChange={handleStatusChange}
              >
                <option value="active">Aktif</option>

                <option value="resolved">Çözüldü</option>
              </select>
            </div>

            <div className="form-group">
              <label>Olay Tarihi *</label>

              <input
                name="occurred_at"
                type="datetime-local"
                value={form.occurred_at}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          {form.status === "resolved" && (
            <div className="form-group">
              <label>Çözülme Tarihi *</label>

              <input
                name="resolved_at"
                type="datetime-local"
                value={form.resolved_at}
                min={form.occurred_at}
                onChange={handleChange}
                required
              />
            </div>
          )}

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
                : trafficEvent
                  ? "Güncelle"
                  : "Olay Ekle"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default TrafficEventModal;
