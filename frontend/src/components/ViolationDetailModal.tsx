import { Camera, Car, Gauge, MapPin, TriangleAlert, X } from "lucide-react";

import { useEffect, useState } from "react";

import api from "../services/api";
import Loading from "./ui/Loading";

interface ViolationDetail {
  id: number;
  speed: number | null;
  speed_limit: number | null;
  latitude: string | number | null;
  longitude: string | number | null;
  status: string;
  detected_at: string;
  vehicle: {
    id: number;
    plate: string;
    brand?: string | null;
    model?: string | null;
    color?: string | null;
  };

  camera: {
    id: number;
    name: string;
    code: string;
  };

  violation_type: {
    id: number;
    name: string;
    code: string;
  };
}

interface ViolationDetailResponse {
  data: ViolationDetail;
}

interface ViolationDetailModalProps {
  open: boolean;
  violationId: number | null;
  onClose: () => void;
}

function getStatusLabel(status: string) {
  const labels: Record<string, string> = {
    detected: "Tespit Edildi",
    reviewed: "İncelendi",
    approved: "Onaylandı",
  };

  return labels[status] ?? status;
}

function calculateExcessPercentage(
  speed: number | null,
  speedLimit: number | null,
) {
  if (speed === null || speedLimit === null || speedLimit <= 0) {
    return null;
  }

  const percentage = ((speed - speedLimit) / speedLimit) * 100;

  return Math.max(percentage, 0);
}

function ViolationDetailModal({
  open,
  violationId,
  onClose,
}: ViolationDetailModalProps) {
  const [violation, setViolation] = useState<ViolationDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open || violationId === null) {
      return;
    }

    let cancelled = false;

    const loadViolation = async () => {
      setLoading(true);
      setError("");
      setViolation(null);

      try {
        const response = await api.get<ViolationDetailResponse>(
          `/violations/${violationId}`,
        );

        if (cancelled) {
          return;
        }

        setViolation(response.data.data);
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("İHLAL DETAYI ALINAMADI:", error);

        setError("İhlal detayları alınamadı.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadViolation();

    return () => {
      cancelled = true;
    };
  }, [open, violationId]);

  useEffect(() => {
    if (!open) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  const excessPercentage = violation
    ? calculateExcessPercentage(violation.speed, violation.speed_limit)
    : null;

  const hasLocation =
    violation !== null &&
    violation.latitude !== null &&
    violation.longitude !== null;

  return (
    <div
      className="violation-detail-overlay"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) {
          onClose();
        }
      }}
    >
      <div
        className="violation-detail-modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="violation-detail-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="violation-detail-header">
          <div>
            <h2 id="violation-detail-title">İhlal Detayı</h2>

            <p>Trafik ihlaline ait detaylı bilgiler</p>
          </div>

          <button
            type="button"
            className="violation-detail-close"
            onClick={onClose}
            aria-label="İhlal detayını kapat"
          >
            <X size={19} />
          </button>
        </div>

        {loading ? (
          <div className="violation-detail-loading">
            <Loading text="İhlal bilgileri yükleniyor..." />
          </div>
        ) : error ? (
          <div className="violation-detail-body">
            <div className="form-error">{error}</div>
          </div>
        ) : violation ? (
          <div className="violation-detail-body">
            <div className="violation-detail-main">
              <div className="violation-detail-icon">
                <TriangleAlert size={24} />
              </div>

              <div>
                <span>İhlal Türü</span>

                <strong>{violation.violation_type.name}</strong>

                <small>{violation.violation_type.code}</small>
              </div>
            </div>

            <div className="violation-detail-grid">
              <div className="violation-detail-card">
                <div className="violation-detail-card-icon">
                  <Car size={18} />
                </div>

                <div>
                  <span>Araç</span>

                  <strong>{violation.vehicle.plate}</strong>

                  {(violation.vehicle.brand || violation.vehicle.model) && (
                    <small>
                      {[violation.vehicle.brand, violation.vehicle.model]
                        .filter(Boolean)
                        .join(" ")}
                    </small>
                  )}

                  {violation.vehicle.color && (
                    <small>Renk: {violation.vehicle.color}</small>
                  )}
                </div>
              </div>

              <div className="violation-detail-card">
                <div className="violation-detail-card-icon">
                  <Camera size={18} />
                </div>

                <div>
                  <span>Kamera</span>

                  <strong>{violation.camera.name}</strong>

                  <small>{violation.camera.code}</small>
                </div>
              </div>

              <div className="violation-detail-card">
                <div className="violation-detail-card-icon">
                  <TriangleAlert size={18} />
                </div>

                <div>
                  <span>Durum</span>

                  <strong>{getStatusLabel(violation.status)}</strong>
                </div>
              </div>

              <div className="violation-detail-card">
                <div className="violation-detail-card-icon">
                  <Gauge size={18} />
                </div>

                <div>
                  <span>Tespit Tarihi</span>

                  <strong>
                    {new Date(violation.detected_at).toLocaleString("tr-TR")}
                  </strong>
                </div>
              </div>
            </div>

            {violation.violation_type.code === "SPEED" && (
              <div className="violation-speed-section">
                <div>
                  <span>Araç Hızı</span>

                  <strong>
                    {violation.speed !== null ? `${violation.speed} km/h` : "-"}
                  </strong>
                </div>

                <div>
                  <span>Hız Limiti</span>

                  <strong>
                    {violation.speed_limit !== null
                      ? `${violation.speed_limit} km/h`
                      : "-"}
                  </strong>
                </div>

                <div>
                  <span>Aşım Oranı</span>

                  <strong className="speed-excess">
                    {excessPercentage !== null
                      ? `%${excessPercentage.toFixed(1)}`
                      : "-"}
                  </strong>
                </div>
              </div>
            )}

            <div className="violation-location-section">
              <div className="violation-location-title">
                <MapPin size={17} />

                <strong>Konum</strong>
              </div>

              {hasLocation ? (
                <span>
                  {violation.latitude}, {violation.longitude}
                </span>
              ) : (
                <span>Konum bilgisi bulunmuyor.</span>
              )}
            </div>
          </div>
        ) : (
          <div className="violation-detail-body">
            <div className="form-error">İhlal bilgisi bulunamadı.</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ViolationDetailModal;
