import { CircleAlert } from "lucide-react";

import type { TrafficEvent } from "../types/dashboard";

interface ActiveTrafficEventsProps {
  events: TrafficEvent[];
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

function ActiveTrafficEvents({ events }: ActiveTrafficEventsProps) {
  if (events.length === 0) {
    return <div className="empty-state">Aktif trafik olayı bulunmuyor.</div>;
  }

  return (
    <div className="events-list">
      {events.map((trafficEvent) => (
        <div className="event-item" key={trafficEvent.id}>
          <div className="event-icon">
            <CircleAlert size={18} />
          </div>

          <div className="event-info">
            <div className="event-title-row">
              <strong>{trafficEvent.title}</strong>

              <span className={`severity-badge ${trafficEvent.severity}`}>
                {getSeverityLabel(trafficEvent.severity)}
              </span>
            </div>

            <p>{trafficEvent.camera?.name ?? "Kamera bilgisi yok"}</p>

            <span className="event-date">
              {new Date(trafficEvent.occurred_at).toLocaleString("tr-TR")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActiveTrafficEvents;
