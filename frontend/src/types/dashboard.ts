export interface ViolationType {
  id: number;
  name: string;
  code: string;
  count: number;
}

export interface Vehicle {
  id: number;
  plate: string;
  brand: string | null;
  model: string | null;
  color: string | null;
  year: number | null;
}

export interface Camera {
  id: number;
  name: string;
  code: string;
  latitude: string;
  longitude: string;
  status: string;
  speed_limit: number | null;
}

export interface ViolationTypeDetail {
  id: number;
  name: string;
  code: string;
  description: string | null;
}

export interface RecentViolation {
  id: number;
  vehicle_id: number;
  camera_id: number;
  violation_type_id: number;
  speed: number | null;
  speed_limit: number | null;
  latitude: string | null;
  longitude: string | null;
  image_path: string | null;
  status: string;
  detected_at: string;
  vehicle: Vehicle;
  camera: Camera;
  violation_type?: ViolationTypeDetail;
  violationType?: ViolationTypeDetail;
}

export interface TrafficEvent {
  id: number;
  camera_id: number | null;
  type: string;
  title: string;
  description: string | null;
  severity: string;
  status: string;
  latitude: string;
  longitude: string;
  occurred_at: string;
  resolved_at: string | null;
  camera: Camera | null;
}

export interface DashboardResponse {
  total_vehicles: number;
  active_cameras: number;
  today_violations: number;
  active_events: number;
  violations_by_type: ViolationType[];
  recent_violations: RecentViolation[];
  active_traffic_events: TrafficEvent[];
}