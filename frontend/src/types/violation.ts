export interface ViolationVehicle {
    id: number;
    plate: string;
    brand: string | null;
    model: string | null;
}

export interface ViolationCamera {
    id: number;
    name: string;
    code: string;
    speed_limit: number | null;
}

export interface ViolationType {
    id: number;
    name: string;
    code: string;
    description: string | null;
}

export interface Violation {
    id: number;

    vehicle: ViolationVehicle;
    camera: ViolationCamera;
    violation_type: ViolationType;

    speed: number | null;
    speed_limit: number | null;

    latitude: string | null;
    longitude: string | null;

    image_path: string | null;

    status:
    | "detected"
    | "reviewed"
    | "approved";

    detected_at: string;

    created_at: string;
    updated_at: string;
}

export interface ViolationFormData {
    vehicle_id: string;
    camera_id: string;
    violation_type_id: string;

    speed: string;
    speed_limit: string;

    latitude: string;
    longitude: string;

    status:
    | "detected"
    | "reviewed"
    | "approved";

    detected_at: string;
}

export interface ViolationsResponse {
    data: Violation[];

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