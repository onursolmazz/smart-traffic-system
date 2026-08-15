<?php

namespace App\Services;

use App\Models\Vehicle;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class VehicleService
{
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Vehicle::query()
            ->latest()
            ->paginate($perPage);
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
