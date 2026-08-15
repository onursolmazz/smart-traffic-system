export type TrafficEventType =
  | "ACCIDENT"
  | "ROAD_WORK"
  | "VEHICLE_BREAKDOWN"
  | "ROAD_CLOSED"
  | "TRAFFIC_JAM";

export type TrafficEventSeverity =
  | "low"
  | "medium"
  | "high"
  | "critical";

export type TrafficEventStatus =
  | "active"
  | "resolved";

export interface TrafficEventCamera {
  id: number;
  name: string;
  code: string;
  latitude: string;
  longitude: string;
  status: string;
  speed_limit: number | null;
}

export interface TrafficEvent {
  id: number;

  camera: TrafficEventCamera | null;

  type: TrafficEventType;

  title: string;

  description: string | null;

  severity: TrafficEventSeverity;

  status: TrafficEventStatus;

  latitude: string;

  longitude: string;

  occurred_at: string;

  resolved_at: string | null;

  created_at: string;

  updated_at: string;
}

export interface TrafficEventFormData {
  camera_id: string;

  type: TrafficEventType;

  title: string;

  description: string;

  severity: TrafficEventSeverity;

  status: TrafficEventStatus;

  latitude: string;

  longitude: string;

  occurred_at: string;

  resolved_at: string;
}

export interface TrafficEventsResponse {
  data: TrafficEvent[];

  meta: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };

  links: {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
  };
}