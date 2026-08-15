import { useEffect, useMemo, useState } from "react";

import {
  CircleMarker,
  LayerGroup,
  LayersControl,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import { Camera, CircleAlert, Gauge, MapPin } from "lucide-react";

import type { LatLngBoundsExpression } from "leaflet";

import Loading from "../components/ui/Loading";

import api from "../services/api";

import type { Camera as CameraType } from "../types/camera";

import type {
  TrafficEvent,
  TrafficEventsResponse,
} from "../types/trafficEvent";

interface CamerasResponse {
  data: CameraType[];
}

type MapPosition = [number, number];

interface FitMapBoundsProps {
  positions: MapPosition[];
}

function FitMapBounds({ positions }: FitMapBoundsProps) {
  const map = useMap();

  useEffect(() => {
    if (positions.length === 0) {
      return;
    }

    if (positions.length === 1) {
      map.setView(positions[0], 14);

      return;
    }

    const bounds = positions as LatLngBoundsExpression;

    map.fitBounds(bounds, {
      padding: [40, 40],
    });
  }, [map, positions]);

  return null;
}

function getCameraStatusLabel(status: string) {
  const labels: Record<string, string> = {
    active: "Aktif",
    inactive: "Pasif",
    maintenance: "Bakımda",
  };

  return labels[status] ?? status;
}

function getCameraColor(status: string) {
  switch (status) {
    case "active":
      return "#22c55e";

    case "maintenance":
      return "#eab308";

    case "inactive":
      return "#6b7280";

    default:
      return "#22c55e";
  }
}

function getSeverityLabel(severity: string) {
  const labels: Record<string, string> = {
    low: "Düşük",
    medium: "Orta",
    high: "Yüksek",
    critical: "Kritik",
  };

  return labels[severity] ?? severity;
}

function getSeverityColor(severity: string) {
  switch (severity) {
    case "low":
      return "#22c55e";

    case "medium":
      return "#eab308";

    case "high":
      return "#f97316";

    case "critical":
      return "#dc2626";

    default:
      return "#dc2626";
  }
}

function getTrafficEventTypeLabel(type: string) {
  const labels: Record<string, string> = {
    ACCIDENT: "Kaza",

    ROAD_WORK: "Yol Çalışması",

    VEHICLE_BREAKDOWN: "Araç Arızası",

    ROAD_CLOSED: "Yol Kapalı",

    TRAFFIC_JAM: "Trafik Yoğunluğu",
  };

  return labels[type] ?? type;
}

function TrafficMap() {
  const [cameras, setCameras] = useState<CameraType[]>([]);

  const [trafficEvents, setTrafficEvents] = useState<TrafficEvent[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    const loadMapData = async () => {
      try {
        const [camerasResponse, eventsResponse] = await Promise.all([
          api.get<CamerasResponse>("/cameras", {
            params: {
              per_page: 100,

              sort_by: "name",

              sort_direction: "asc",
            },
          }),

          api.get<TrafficEventsResponse>("/traffic-events", {
            params: {
              status: "active",

              per_page: 100,

              sort_by: "occurred_at",

              sort_direction: "desc",
            },
          }),
        ]);

        if (cancelled) {
          return;
        }

        setCameras(camerasResponse.data.data);

        setTrafficEvents(eventsResponse.data.data);

        setError("");
      } catch (error) {
        if (cancelled) {
          return;
        }

        console.error("HARİTA VERİLERİ YÜKLEME HATASI:", error);

        setError("Harita verileri alınamadı.");
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    void loadMapData();

    return () => {
      cancelled = true;
    };
  }, []);

  const cameraPositions = useMemo<MapPosition[]>(
    () =>
      cameras
        .map((camera) => {
          const latitude = Number(camera.latitude);

          const longitude = Number(camera.longitude);

          if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return null;
          }

          return [latitude, longitude] as MapPosition;
        })
        .filter((position): position is MapPosition => position !== null),
    [cameras],
  );

  const eventPositions = useMemo<MapPosition[]>(
    () =>
      trafficEvents
        .map((trafficEvent) => {
          const latitude = Number(trafficEvent.latitude);

          const longitude = Number(trafficEvent.longitude);

          if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return null;
          }

          return [latitude, longitude] as MapPosition;
        })
        .filter((position): position is MapPosition => position !== null),
    [trafficEvents],
  );

  const allPositions = useMemo(
    () => [...cameraPositions, ...eventPositions],
    [cameraPositions, eventPositions],
  );

  const activeCameras = cameras.filter(
    (camera) => camera.status === "active",
  ).length;

  if (loading) {
    return <Loading text="Trafik haritası yükleniyor..." />;
  }

  return (
    <div className="traffic-map-page">
      <div className="page-heading">
        <div>
          <h1>Trafik Haritası</h1>

          <p>
            Kameraları ve aktif trafik olaylarını harita üzerinden görüntüleyin.
          </p>
        </div>
      </div>

      <div className="map-statistics">
        <div className="map-stat-card">
          <div className="map-stat-icon">
            <Camera size={19} />
          </div>

          <div>
            <span>Toplam Kamera</span>

            <strong>{cameras.length}</strong>
          </div>
        </div>

        <div className="map-stat-card">
          <div className="map-stat-icon">
            <Gauge size={19} />
          </div>

          <div>
            <span>Aktif Kamera</span>

            <strong>{activeCameras}</strong>
          </div>
        </div>

        <div className="map-stat-card">
          <div className="map-stat-icon event">
            <CircleAlert size={19} />
          </div>

          <div>
            <span>Aktif Trafik Olayı</span>

            <strong>{trafficEvents.length}</strong>
          </div>
        </div>
      </div>

      {error && <div className="form-error">{error}</div>}

      <div className="traffic-map-card">
        <MapContainer
          center={[39.9334, 32.8597]}
          zoom={11}
          scrollWheelZoom={true}
          className="traffic-map"
        >
          <TileLayer
            attribution="&copy; OpenStreetMap katkıda bulunanlar"
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          <FitMapBounds positions={allPositions} />

          <LayersControl position="topright">
            <LayersControl.Overlay checked name="Kameralar">
              <LayerGroup>
                {cameras.map((camera) => {
                  const latitude = Number(camera.latitude);

                  const longitude = Number(camera.longitude);

                  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
                    return null;
                  }

                  const color = getCameraColor(camera.status);

                  return (
                    <CircleMarker
                      key={`camera-${camera.id}`}
                      center={[latitude, longitude]}
                      radius={8}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.9,
                        weight: 2,
                      }}
                    >
                      <Popup>
                        <div className="map-popup">
                          <div className="map-popup-title">
                            <Camera size={17} />

                            <strong>{camera.name}</strong>
                          </div>

                          <div className="map-popup-row">
                            <span>Kamera Kodu</span>

                            <strong>{camera.code}</strong>
                          </div>

                          <div className="map-popup-row">
                            <span>Durum</span>

                            <strong>
                              {getCameraStatusLabel(camera.status)}
                            </strong>
                          </div>

                          <div className="map-popup-row">
                            <span>Hız Limiti</span>

                            <strong>
                              {camera.speed_limit
                                ? `${camera.speed_limit} km/h`
                                : "-"}
                            </strong>
                          </div>

                          <div className="map-popup-location">
                            <MapPin size={14} />
                            {camera.latitude}, {camera.longitude}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>

            <LayersControl.Overlay checked name="Aktif Trafik Olayları">
              <LayerGroup>
                {trafficEvents.map((trafficEvent) => {
                  const latitude = Number(trafficEvent.latitude);

                  const longitude = Number(trafficEvent.longitude);

                  if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
                    return null;
                  }

                  const color = getSeverityColor(trafficEvent.severity);

                  return (
                    <CircleMarker
                      key={`event-${trafficEvent.id}`}
                      center={[latitude, longitude]}
                      radius={10}
                      pathOptions={{
                        color,
                        fillColor: color,
                        fillOpacity: 0.8,
                        weight: 3,
                      }}
                    >
                      <Popup>
                        <div className="map-popup">
                          <div className="map-popup-title traffic-event">
                            <CircleAlert size={17} />

                            <strong>{trafficEvent.title}</strong>
                          </div>

                          <div className="map-popup-row">
                            <span>Olay Türü</span>

                            <strong>
                              {getTrafficEventTypeLabel(trafficEvent.type)}
                            </strong>
                          </div>

                          <div className="map-popup-row">
                            <span>Önem Seviyesi</span>

                            <strong>
                              {getSeverityLabel(trafficEvent.severity)}
                            </strong>
                          </div>

                          <div className="map-popup-row">
                            <span>Kamera</span>

                            <strong>{trafficEvent.camera?.code ?? "-"}</strong>
                          </div>

                          <div className="map-popup-row">
                            <span>Tarih</span>

                            <strong>
                              {new Date(
                                trafficEvent.occurred_at,
                              ).toLocaleString("tr-TR")}
                            </strong>
                          </div>

                          {trafficEvent.description && (
                            <div className="map-popup-description">
                              {trafficEvent.description}
                            </div>
                          )}

                          <div className="map-popup-location">
                            <MapPin size={14} />
                            {trafficEvent.latitude}, {trafficEvent.longitude}
                          </div>
                        </div>
                      </Popup>
                    </CircleMarker>
                  );
                })}
              </LayerGroup>
            </LayersControl.Overlay>
          </LayersControl>
        </MapContainer>
      </div>

      <div className="map-legend">
        <div className="map-legend-item">
          <span className="map-legend-dot camera-active" />
          Aktif Kamera
        </div>

        <div className="map-legend-item">
          <span className="map-legend-dot camera-maintenance" />
          Bakımdaki Kamera
        </div>

        <div className="map-legend-item">
          <span className="map-legend-dot camera-inactive" />
          Pasif Kamera
        </div>

        <div className="map-legend-separator" />

        <div className="map-legend-item">
          <span className="map-legend-dot event-low" />
          Düşük
        </div>

        <div className="map-legend-item">
          <span className="map-legend-dot event-medium" />
          Orta
        </div>

        <div className="map-legend-item">
          <span className="map-legend-dot event-high" />
          Yüksek
        </div>

        <div className="map-legend-item">
          <span className="map-legend-dot event-critical" />
          Kritik
        </div>
      </div>
    </div>
  );
}

export default TrafficMap;
