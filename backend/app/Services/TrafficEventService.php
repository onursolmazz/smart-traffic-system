<?php

namespace App\Services;

use App\Models\TrafficEvent;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Support\Facades\Cache;

class TrafficEventService
{
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return TrafficEvent::query()
            ->with('camera')
            ->latest('occurred_at')
            ->paginate($perPage);
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
