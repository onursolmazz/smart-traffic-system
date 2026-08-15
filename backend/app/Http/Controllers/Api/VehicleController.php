<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Requests\UpdateVehicleRequest;
use App\Http\Resources\VehicleResource;
use App\Models\Vehicle;
use App\Services\VehicleService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;
use App\Http\Requests\VehicleFilterRequest;

class VehicleController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function __construct(
        private readonly VehicleService $vehicleService
    ) {}

    public function index(
        VehicleFilterRequest $request
    ): AnonymousResourceCollection {
        $vehicles = $this->vehicleService->paginate(
            $request->validated()
        );

        return VehicleResource::collection($vehicles);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(StoreVehicleRequest $request): VehicleResource
    {
        $vehicle = $this->vehicleService->create(
            $request->validated()
        );

        return new VehicleResource($vehicle);
    }

    /**
     * Display the specified resource.
     */
    public function show(Vehicle $vehicle): VehicleResource
    {
        return new VehicleResource($vehicle);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(
        UpdateVehicleRequest $request,
        Vehicle $vehicle
    ): VehicleResource {
        $vehicle = $this->vehicleService->update(
            $vehicle,
            $request->validated()
        );

        return new VehicleResource($vehicle);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Vehicle $vehicle): Response
    {
        $this->vehicleService->delete($vehicle);
        return response()->noContent();
    }
}
