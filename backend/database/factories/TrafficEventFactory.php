<?php

namespace Database\Factories;

use App\Models\Camera;
use Illuminate\Database\Eloquent\Factories\Factory;

class TrafficEventFactory extends Factory
{
    public function definition(): array
    {
        $camera = Camera::query()
            ->inRandomOrder()
            ->first();

        $hasCamera = fake()->boolean(80);

        $type = fake()->randomElement([
            'ACCIDENT',
            'ROAD_WORK',
            'VEHICLE_BREAKDOWN',
            'ROAD_CLOSED',
            'TRAFFIC_JAM',
        ]);

        $status = fake()->randomElement([
            'active',
            'resolved',
        ]);

        $occurredAt = fake()->dateTimeBetween(
            '-30 days',
            'now'
        );

        return [
            'camera_id' => $hasCamera
                ? $camera->id
                : null,

            'type' => $type,

            'title' => match ($type) {
                'ACCIDENT' => 'Trafik Kazası',
                'ROAD_WORK' => 'Yol Çalışması',
                'VEHICLE_BREAKDOWN' => 'Arızalı Araç',
                'ROAD_CLOSED' => 'Yol Kapalı',
                'TRAFFIC_JAM' => 'Trafik Yoğunluğu',
            },

            'description' => fake()->sentence(),

            'severity' => fake()->randomElement([
                'low',
                'medium',
                'high',
                'critical',
            ]),

            'status' => $status,

            'latitude' => $hasCamera
                ? $camera->latitude
                : fake()->latitude(40.90, 41.10),

            'longitude' => $hasCamera
                ? $camera->longitude
                : fake()->longitude(28.80, 29.30),

            'occurred_at' => $occurredAt,

            'resolved_at' => $status === 'resolved'
                ? fake()->dateTimeBetween($occurredAt, 'now')
                : null,
        ];
    }
}
