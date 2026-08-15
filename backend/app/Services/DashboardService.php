<?php

namespace App\Services;

use App\Models\Camera;
use App\Models\TrafficEvent;
use App\Models\Vehicle;
use App\Models\Violation;
use App\Models\ViolationType;

class DashboardService
{
    public function getStatistics(): array
    {
        $today = today();

        $totalVehicles = Vehicle::count();

        $activeCameras = Camera::query()
            ->where('status', 'active')
            ->count();

        $todayViolations = Violation::query()
            ->whereDate('detected_at', $today)
            ->count();

        $activeEvents = TrafficEvent::query()
            ->where('status', 'active')
            ->count();

        $violationsByType = ViolationType::query()
            ->withCount([
                'violations' => function ($query) use ($today) {
                    $query->whereDate('detected_at', $today);
                },
            ])
            ->get()
            ->map(function (ViolationType $type) {
                return [
                    'id' => $type->id,
                    'name' => $type->name,
                    'code' => $type->code,
                    'count' => $type->violations_count,
                ];
            });

        $recentViolations = Violation::query()
            ->with([
                'vehicle',
                'camera',
                'violationType',
            ])
            ->latest('detected_at')
            ->limit(10)
            ->get();

        $activeTrafficEvents = TrafficEvent::query()
            ->with('camera')
            ->where('status', 'active')
            ->latest('occurred_at')
            ->limit(10)
            ->get();

        return [
            'total_vehicles' => $totalVehicles,
            'active_cameras' => $activeCameras,
            'today_violations' => $todayViolations,
            'active_events' => $activeEvents,
            'violations_by_type' => $violationsByType,
            'recent_violations' => $recentViolations,
            'active_traffic_events' => $activeTrafficEvents,
        ];
    }
}
