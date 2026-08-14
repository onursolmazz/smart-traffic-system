<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCameraRequest;
use App\Http\Requests\UpdateCameraRequest;
use App\Http\Resources\CameraResource;
use App\Models\Camera;
use App\Services\CameraService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class CameraController extends Controller
{
    public function __construct(
        private readonly CameraService $cameraService
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $cameras = $this->cameraService->paginate();

        return CameraResource::collection($cameras);
    }

    public function store(
        StoreCameraRequest $request
    ): CameraResource {
        $camera = $this->cameraService->create($request->validated());
        return new CameraResource($camera);
    }

    public function show(
        Camera $camera
    ): CameraResource {
        return new CameraResource($camera);
    }

    public function update(
        UpdateCameraRequest $request,
        Camera $camera
    ): CameraResource {
        $camera = $this->cameraService->update(
            $camera,
            $request->validated()
        );

        return new CameraResource($camera);
    }

    public function destroy(
        Camera $camera
    ): Response {
        $this->cameraService->delete($camera);

        return response()->noContent();
    }
}
