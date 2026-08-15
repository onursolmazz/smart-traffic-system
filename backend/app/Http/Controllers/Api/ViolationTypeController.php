<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\ViolationTypeResource;
use App\Models\ViolationType;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ViolationTypeController extends Controller
{
    public function index(): AnonymousResourceCollection
    {
        $types = ViolationType::query()
            ->orderBy('name')
            ->get();

        return ViolationTypeResource::collection($types);
    }
}
