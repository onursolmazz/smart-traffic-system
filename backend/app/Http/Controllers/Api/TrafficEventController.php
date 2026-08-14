<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreTrafficEventRequest;
use App\Http\Requests\UpdateTrafficEventRequest;
use App\Http\Resources\TrafficEventResource;
use App\Models\TrafficEvent;
use App\Services\TrafficEventService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class TrafficEventController extends Controller
{
    public function __construct(
        private readonly TrafficEventService $trafficEventService
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $events = $this->trafficEventService->paginate();

        return TrafficEventResource::collection($events);
    }

    public function store(
        StoreTrafficEventRequest $request
    ): TrafficEventResource {
        $event = $this->trafficEventService->create(
            $request->validated()
        );

        return new TrafficEventResource($event);
    }

    public function show(
        TrafficEvent $trafficEvent
    ): TrafficEventResource {
        $event = $this->trafficEventService
            ->loadRelations($trafficEvent);

        return new TrafficEventResource($event);
    }

    public function update(
        UpdateTrafficEventRequest $request,
        TrafficEvent $trafficEvent
    ): TrafficEventResource {
        $event = $this->trafficEventService->update(
            $trafficEvent,
            $request->validated()
        );

        return new TrafficEventResource($event);
    }

    public function destroy(
        TrafficEvent $trafficEvent
    ): Response {
        $this->trafficEventService->delete($trafficEvent);

        return response()->noContent();
    }
}
