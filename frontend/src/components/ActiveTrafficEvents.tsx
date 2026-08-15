import { CircleAlert } from "lucide-react";

import type { TrafficEvent } from "../types/dashboard";

interface ActiveTrafficEventsProps {
  events: TrafficEvent[];
}

function ActiveTrafficEvents({ events }: ActiveTrafficEventsProps) {
  if (events.length === 0) {
    return <div className="empty-state">Aktif trafik olayı bulunmuyor.</div>;
  }

  return (
    <div className="events-list">
      {events.map((event) => (
        <div className="event-item" key={event.id}>
          <div className="event-icon">
            <CircleAlert size={18} />
          </div>

          <div className="event-info">
            <div className="event-title-row">
              <strong>{event.title}</strong>

              <span className={`severity-badge ${event.severity}`}>
                {event.severity}
              </span>
            </div>

            <p>{event.camera?.name ?? "Kamera bilgisi yok"}</p>

            <span className="event-date">
              {new Date(event.occurred_at).toLocaleString("tr-TR")}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActiveTrafficEvents;
