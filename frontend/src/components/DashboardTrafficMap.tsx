import { useEffect, useMemo } from "react";

import {
  CircleMarker,
  MapContainer,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";

import type { LatLngBoundsExpression } from "leaflet";

import { Camera, CircleAlert } from "lucide-react";

import type { Camera as CameraType } from "../types/camera";

import type { TrafficEvent } from "../types/dashboard";

interface DashboardTrafficMapProps {
  cameras: CameraType[];
  events: TrafficEvent[];
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

    map.fitBounds(positions as LatLngBoundsExpression, {
      padding: [30, 30],
    });
  }, [map, positions]);

  return null;
}

function getCameraColor(status: string) {
  if (status === "active") {
    return "#22c55e";
  }

  if (status === "maintenance") {
    return "#eab308";
  }

  return "#6b7280";
}

function getEventColor(severity: string) {
  if (severity === "critical") {
    return "#dc2626";
  }

  if (severity === "high") {
    return "#f97316";
  }

  if (severity === "medium") {
    return "#eab308";
  }

  return "#22c55e";
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

function DashboardTrafficMap({ cameras, events }: DashboardTrafficMapProps) {
  const positions = useMemo<MapPosition[]>(() => {
    const cameraPositions = cameras
      .map((camera) => {
        const latitude = Number(camera.latitude);

        const longitude = Number(camera.longitude);

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
          return null;
        }

        return [latitude, longitude] as MapPosition;
      })
      .filter((position): position is MapPosition => position !== null);

    const eventPositions = events
      .map((event) => {
        const latitude = Number(event.latitude);

        const longitude = Number(event.longitude);

        if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
          return null;
        }

        return [latitude, longitude] as MapPosition;
      })
      .filter((position): position is MapPosition => position !== null);

    return [...cameraPositions, ...eventPositions];
  }, [cameras, events]);

  return (
    <div className="dashboard-map-wrapper">
      <MapContainer
        center={[39.9334, 32.8597]}
        zoom={11}
        scrollWheelZoom={false}
        className="dashboard-map"
      >
        <TileLayer
          attribution="&copy; OpenStreetMap katkıda bulunanlar"
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        <FitMapBounds positions={positions} />

        {cameras.map((camera) => {
          const latitude = Number(camera.latitude);

          const longitude = Number(camera.longitude);

          if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return null;
          }

          const color = getCameraColor(camera.status);

          return (
            <CircleMarker
              key={`dashboard-camera-${camera.id}`}
              center={[latitude, longitude]}
              radius={6}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.9,
                weight: 2,
              }}
            >
              <Popup>
                <div className="dashboard-map-popup">
                  <strong>
                    <Camera size={14} />

                    {camera.name}
                  </strong>

                  <span>{camera.code}</span>

                  <span>
                    Hız Limiti:{" "}
                    {camera.speed_limit ? `${camera.speed_limit} km/h` : "-"}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}

        {events.map((event) => {
          const latitude = Number(event.latitude);

          const longitude = Number(event.longitude);

          if (Number.isNaN(latitude) || Number.isNaN(longitude)) {
            return null;
          }

          const color = getEventColor(event.severity);

          return (
            <CircleMarker
              key={`dashboard-event-${event.id}`}
              center={[latitude, longitude]}
              radius={8}
              pathOptions={{
                color,
                fillColor: color,
                fillOpacity: 0.85,
                weight: 3,
              }}
            >
              <Popup>
                <div className="dashboard-map-popup">
                  <strong>
                    <CircleAlert size={14} />

                    {event.title}
                  </strong>

                  <span>Önem: {getSeverityLabel(event.severity)}</span>

                  <span>{event.camera?.name ?? "Kamera bilgisi yok"}</span>

                  <span>
                    {new Date(event.occurred_at).toLocaleString("tr-TR")}
                  </span>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </div>
  );
}

export default DashboardTrafficMap;
