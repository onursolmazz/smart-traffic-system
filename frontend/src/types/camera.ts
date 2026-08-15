export interface Camera {
    id: number;
    name: string;
    code: string;
    latitude: string;
    longitude: string;
    status: "active" | "inactive" | "maintenance";
    speed_limit: number | null;
    created_at: string;
    updated_at: string;
}

export interface CameraFormData {
    name: string;
    code: string;
    latitude: string;
    longitude: string;
    status: "active" | "inactive" | "maintenance";
    speed_limit: string;
}

export interface CameraPaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
}

export interface CamerasResponse {
    data: Camera[];

    meta: CameraPaginationMeta;

    links: {
        first: string | null;
        last: string | null;
        prev: string | null;
        next: string | null;
    };
}