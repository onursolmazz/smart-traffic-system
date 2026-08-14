<?php

namespace Database\Factories;

use App\Models\Camera;
use App\Models\Vehicle;
use App\Models\ViolationType;
use Illuminate\Database\Eloquent\Factories\Factory;

class ViolationFactory extends Factory
{
    public function definition(): array
    {
        $vehicle = Vehicle::query()
            ->inRandomOrder()
            ->first();

        $camera = Camera::query()
            ->inRandomOrder()
            ->first();

        $violationType = ViolationType::query()
            ->inRandomOrder()
            ->first();

        $speed = null;
        $speedLimit = null;

        if ($violationType->code === 'SPEED') {
            $speedLimit = $camera->speed_limit;

            $speed = fake()->numberBetween(
                $speedLimit + 5,
                $speedLimit + 60
            );
        }

        return [
            'vehicle_id' => $vehicle->id,

            'camera_id' => $camera->id,

            'violation_type_id' => $violationType->id,

            'speed' => $speed,

            'speed_limit' => $speedLimit,

            'latitude' => $camera->latitude,

            'longitude' => $camera->longitude,

            'image_path' => null,

            'status' => fake()->randomElement([
                'detected',
                'reviewed',
                'approved',
            ]),

            'detected_at' => fake()->dateTimeBetween(
                '-30 days',
                'now'
            ),
        ];
    }
}
