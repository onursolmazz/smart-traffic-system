<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ViolationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'vehicle' => new VehicleResource(
                $this->whenLoaded('vehicle')
            ),
            'camera' => new CameraResource(
                $this->whenLoaded('camera')
            ),
            'violation_type' => new ViolationTypeResource(
                $this->whenLoaded('violationType')
            ),
            'speed' => $this->speed,
            'speed_limit' => $this->speed_limit,
            'latitude' => $this->latitude,
            'longitude' => $this->longitude,
            'image_path' => $this->image_path,
            'status' => $this->status,
            'detected_at' => $this->detected_at,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
