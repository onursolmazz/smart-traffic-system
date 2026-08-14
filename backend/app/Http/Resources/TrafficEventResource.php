<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrafficEventResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'camera' => new CameraResource(
                $this->whenLoaded('camera')
            ),

            'type' => $this->type,

            'title' => $this->title,

            'description' => $this->description,

            'severity' => $this->severity,

            'status' => $this->status,

            'latitude' => $this->latitude,

            'longitude' => $this->longitude,

            'occurred_at' => $this->occurred_at,

            'resolved_at' => $this->resolved_at,

            'created_at' => $this->created_at,

            'updated_at' => $this->updated_at,
        ];
    }
}
