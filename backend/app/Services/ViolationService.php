<?php

namespace App\Services;

use App\Models\Violation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;
use App\Jobs\ProcessViolation;

class ViolationService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = Violation::query()
            ->with([
                'vehicle',
                'camera',
                'violationType',
            ]);

        if (!empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($query) use ($search) {
                $query
                    ->whereHas('vehicle', function ($query) use ($search) {
                        $query->where(
                            'plate',
                            'like',
                            "%{$search}%"
                        );
                    })
                    ->orWhereHas('camera', function ($query) use ($search) {
                        $query
                            ->where(
                                'name',
                                'like',
                                "%{$search}%"
                            )
                            ->orWhere(
                                'code',
                                'like',
                                "%{$search}%"
                            );
                    });
            });
        }

        if (!empty($filters['status'])) {
            $query->where(
                'status',
                $filters['status']
            );
        }

        if (!empty($filters['type'])) {
            $type = $filters['type'];

            $query->whereHas(
                'violationType',
                function ($query) use ($type) {
                    $query->where('code', $type);
                }
            );
        }

        if (!empty($filters['camera_id'])) {
            $query->where(
                'camera_id',
                $filters['camera_id']
            );
        }

        if (!empty($filters['vehicle_id'])) {
            $query->where(
                'vehicle_id',
                $filters['vehicle_id']
            );
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate(
                'detected_at',
                '>=',
                $filters['date_from']
            );
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate(
                'detected_at',
                '<=',
                $filters['date_to']
            );
        }

        $sortBy =
            $filters['sort_by'] ?? 'detected_at';

        $sortDirection =
            $filters['sort_direction'] ?? 'desc';

        $perPage =
            $filters['per_page'] ?? 15;

        return $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function loadRelations(Violation $violation): Violation
    {
        return $violation->load([
            'vehicle',
            'camera',
            'violationType',
        ]);
    }

    public function create(array $data): Violation
    {
        $violation = Violation::create($data);
        Cache::forget('dashboard.statistics');
        ProcessViolation::dispatch(
            $violation->id
        );

        return $violation;
    }

    public function update(
        Violation $violation,
        array $data
    ): Violation {
        $violation->update($data);
        Cache::forget('dashboard.statistics');
        return $this->loadRelations(
            $violation->refresh()
        );
    }

    public function delete(Violation $violation): void
    {
        $violation->delete();
        Cache::forget('dashboard.statistics');
    }
}
