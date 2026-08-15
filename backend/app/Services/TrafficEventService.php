<?php

namespace App\Services;

use App\Models\TrafficEvent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class TrafficEventService
{
    public function paginate(array $filters): LengthAwarePaginator
    {
        $query = TrafficEvent::query()
            ->with('camera');

        if (!empty($filters['search'])) {
            $search = $filters['search'];

            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'title',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'description',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhereHas(
                        'camera',
                        function ($query) use ($search) {
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
                        }
                    );
            });
        }

        if (!empty($filters['status'])) {
            $query->where(
                'status',
                $filters['status']
            );
        }

        if (!empty($filters['severity'])) {
            $query->where(
                'severity',
                $filters['severity']
            );
        }

        if (!empty($filters['type'])) {
            $query->where(
                'type',
                $filters['type']
            );
        }

        if (!empty($filters['camera_id'])) {
            $query->where(
                'camera_id',
                $filters['camera_id']
            );
        }

        if (!empty($filters['date_from'])) {
            $query->whereDate(
                'occurred_at',
                '>=',
                $filters['date_from']
            );
        }

        if (!empty($filters['date_to'])) {
            $query->whereDate(
                'occurred_at',
                '<=',
                $filters['date_to']
            );
        }

        $sortBy =
            $filters['sort_by'] ?? 'occurred_at';

        $sortDirection =
            $filters['sort_direction'] ?? 'desc';

        $perPage =
            $filters['per_page'] ?? 15;

        return $query
            ->orderBy($sortBy, $sortDirection)
            ->paginate($perPage)
            ->withQueryString();
    }

    public function loadRelations(
        TrafficEvent $trafficEvent
    ): TrafficEvent {
        return $trafficEvent->load('camera');
    }

    public function create(array $data): TrafficEvent
    {
        if (($data['status'] ?? 'active') === 'resolved') {
            $data['resolved_at'] ??= now();
        }

        if (($data['status'] ?? 'active') === 'active') {
            $data['resolved_at'] = null;
        }

        $trafficEvent = TrafficEvent::create($data);
        Cache::forget('dashboard.statistics');
        return $this->loadRelations($trafficEvent);
    }

    public function update(
        TrafficEvent $trafficEvent,
        array $data
    ): TrafficEvent {
        $newStatus = $data['status'] ?? $trafficEvent->status;

        if ($newStatus === 'resolved') {
            $data['resolved_at'] ??=
                $trafficEvent->resolved_at ?? now();
        }

        if ($newStatus === 'active') {
            $data['resolved_at'] = null;
        }

        $trafficEvent->update($data);
        Cache::forget('dashboard.statistics');
        return $this->loadRelations(
            $trafficEvent->refresh()
        );
    }

    public function delete(
        TrafficEvent $trafficEvent
    ): void {
        $trafficEvent->delete();
        Cache::forget('dashboard.statistics');
    }
}
