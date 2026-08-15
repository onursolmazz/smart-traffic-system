<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AlertResource;
use App\Models\Alert;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Request;

class AlertController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        $query = Alert::query()
            ->with([
                'violation.vehicle',
                'violation.camera',
                'violation.violationType',
            ]);
        if ($request->status === 'unread') {
            $query->whereNull('read_at');
        }

        if ($request->status === 'read') {
            $query->whereNotNull('read_at');
        }

        if ($request->filled('severity')) {
            $query->where(
                'severity',
                $request->severity,
            );
        }
        if ($request->filled('search')) {
            $search = $request->search;

            $query->where(function ($query) use ($search) {
                $query
                    ->where(
                        'title',
                        'like',
                        "%{$search}%"
                    )
                    ->orWhere(
                        'message',
                        'like',
                        "%{$search}%"
                    );
            });
        }

        $perPage = min(
            (int) $request->get('per_page', 15),
            100,
        );

        $alerts = $query
            ->latest()
            ->paginate($perPage);

        $unreadCount = Alert::query()
            ->whereNull('read_at')
            ->count();

        return AlertResource::collection($alerts)
            ->additional([
                'unread_count' => $unreadCount,
            ]);
    }

    public function markAsRead(Alert $alert): JsonResponse
    {
        if ($alert->read_at === null) {
            $alert->update([
                'read_at' => now(),
            ]);
        }

        return response()->json([
            'message' => 'Bildirim okundu olarak işaretlendi.',
        ]);
    }

    public function markAllAsRead(): JsonResponse
    {
        Alert::query()
            ->whereNull('read_at')
            ->update([
                'read_at' => now(),
            ]);

        return response()->json([
            'message' => 'Tüm bildirimler okundu olarak işaretlendi.',
        ]);
    }
}
