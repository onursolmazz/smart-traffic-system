<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AlertResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,

            'violation_id' => $this->violation_id,

            'title' => $this->title,

            'message' => $this->message,

            'severity' => $this->severity,

            'is_read' => $this->read_at !== null,

            'read_at' => $this->read_at,

            'created_at' => $this->created_at,

            'violation' => $this->whenLoaded(
                'violation',
                function () {
                    return [
                        'id' => $this->violation?->id,

                        'vehicle' => [
                            'id' => $this->violation?->vehicle?->id,
                            'plate' => $this->violation?->vehicle?->plate,
                        ],

                        'camera' => [
                            'id' => $this->violation?->camera?->id,
                            'name' => $this->violation?->camera?->name,
                            'code' => $this->violation?->camera?->code,
                        ],

                        'violation_type' => [
                            'id' => $this->violation?->violationType?->id,
                            'name' => $this->violation?->violationType?->name,
                            'code' => $this->violation?->violationType?->code,
                        ],
                    ];
                },
            ),
        ];
    }
}
