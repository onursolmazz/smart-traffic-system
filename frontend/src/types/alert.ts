export type AlertSeverity =
    | "low"
    | "medium"
    | "high"
    | "critical";

export interface AlertViolationVehicle {
    id: number | null;
    plate: string | null;
}

export interface AlertViolationCamera {
    id: number | null;
    name: string | null;
    code: string | null;
}

export interface AlertViolationType {
    id: number | null;
    name: string | null;
    code: string | null;
}

export interface AlertViolation {
    id: number;
    vehicle: AlertViolationVehicle;
    camera: AlertViolationCamera;
    violation_type: AlertViolationType;
}

export interface Alert {
    id: number;
    violation_id: number | null;
    title: string;
    message: string;
    severity: AlertSeverity;
    is_read: boolean;
    read_at: string | null;
    created_at: string;
    violation?: AlertViolation;
}

export interface AlertsResponse {
    data: Alert[];
    unread_count: number;
}
export interface AlertPaginationMeta {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

export interface AlertPaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface AlertsPageResponse {
    data: Alert[];
    unread_count: number;
    meta: AlertPaginationMeta;
    links: AlertPaginationLinks;
}