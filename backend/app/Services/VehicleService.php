<?php

namespace App\Services;

use App\Models\Vehicle;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class VehicleService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Vehicle::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($query) use ($search) {
                $query
                    ->where('plate', 'like', "%{$search}%")
                    ->orWhere('brand', 'like', "%{$search}%")
                    ->orWhere('model', 'like', "%{$search}%")
                    ->orWhere('color', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['year'])) {
            $query->where('year', $filters['year']);
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';

        $sortDirection = $filters['sort_direction'] ?? 'desc';

        $perPage = $filters['per_page'] ?? 15;

        return $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Vehicle
    {
        return Vehicle::create($data);
        Cache::forget('dashboard.statistics');
        return $vehicle;
    }

    public function update(Vehicle $vehicle, array $data): Vehicle
    {
        $vehicle->update($data);
        Cache::forget('dashboard.statistics');
        return $vehicle->refresh();
    }

    public function delete(Vehicle $vehicle): void
    {
        $vehicle->delete();
        Cache::forget('dashboard.statistics');
    }
}
