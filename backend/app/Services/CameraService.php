<?php

namespace App\Services;

use App\Models\Camera;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class CameraService
{
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Camera::query()
            ->latest()
            ->paginate($perPage);
    }

    public function create(array $data): Camera
    {
        return Camera::create($data);
    }

    public function update(
        Camera $camera,
        array $data
    ): Camera {
        $camera->update($data);

        return $camera->refresh();
    }

    public function delete(Camera $camera): void
    {
        $camera->delete();
    }
}
