export interface Vehicle {
    id: number;
    plate: string;
    brand: string | null;
    model: string | null;
    color: string | null;
    year: number | null;
    created_at: string;
    updated_at: string;
}

export interface PaginationMeta {
    current_page: number;
    from: number | null;
    last_page: number;
    per_page: number;
    to: number | null;
    total: number;
}

export interface PaginationLinks {
    first: string | null;
    last: string | null;
    prev: string | null;
    next: string | null;
}

export interface VehiclesResponse {
    data: Vehicle[];
    links: PaginationLinks;
    meta: PaginationMeta;
}
export interface VehicleFormData {
    plate: string;
    brand: string;
    model: string;
    color: string;
    year: string;
}