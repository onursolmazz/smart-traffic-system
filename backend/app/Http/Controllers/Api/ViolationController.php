<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreViolationRequest;
use App\Http\Requests\UpdateViolationRequest;
use App\Http\Resources\ViolationResource;
use App\Models\Violation;
use App\Services\ViolationService;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Http\Response;

class ViolationController extends Controller
{
    public function __construct(
        private readonly ViolationService $violationService
    ) {}

    public function index(): AnonymousResourceCollection
    {
        $violations = $this->violationService->paginate();

        return ViolationResource::collection($violations);
    }

    public function store(
        StoreViolationRequest $request
    ): ViolationResource {
        $violation = $this->violationService->create(
            $request->validated()
        );

        return new ViolationResource($violation);
    }

    public function show(
        Violation $violation
    ): ViolationResource {
        $violation = $this->violationService
            ->loadRelations($violation);

        return new ViolationResource($violation);
    }

    public function update(
        UpdateViolationRequest $request,
        Violation $violation
    ): ViolationResource {
        $violation = $this->violationService->update(
            $violation,
            $request->validated()
        );

        return new ViolationResource($violation);
    }

    public function destroy(
        Violation $violation
    ): Response {
        $this->violationService->delete($violation);

        return response()->noContent();
    }
}
