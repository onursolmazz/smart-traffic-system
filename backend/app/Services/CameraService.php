<?php

namespace App\Services;

use App\Models\Camera;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class CameraService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Camera::query();

        if (!empty($filters['search'])) {
            $search = $filters['search'];
            $query->where(function ($query) use ($search) {
                $query
                    ->where('name', 'like', "%{$search}%")
                    ->orWhere('code', 'like', "%{$search}%");
            });
        }

        if (!empty($filters['status'])) {
            $query->where('status', $filters['status']);
        }

        if (!empty($filters['speed_limit'])) {
            $query->where(
                'speed_limit',
                $filters['speed_limit']
            );
        }

        $sortBy = $filters['sort_by'] ?? 'created_at';

        $sortDirection =
            $filters['sort_direction'] ?? 'desc';

        $perPage = $filters['per_page'] ?? 15;

        return $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function create(array $data): Camera
    {
        return Camera::create($data);
        Cache::forget('dashboard.statistics');
        return $camera;
    }

    public function update(
        Camera $camera,
        array $data
    ): Camera {
        $camera->update($data);
        Cache::forget('dashboard.statistics');
        return $camera->refresh();
    }

    public function delete(Camera $camera): void
    {
        $camera->delete();
        Cache::forget('dashboard.statistics');
    }
}
