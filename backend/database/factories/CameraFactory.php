<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class CameraFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => 'Traffic Camera ' . fake()->unique()->numberBetween(1, 999),
            'code' => 'CAM-' . fake()->unique()->numberBetween(1000, 9999),

            'latitude' => fake()->latitude(40.90, 41.10),
            'longitude' => fake()->longitude(28.80, 29.30),

            'status' => fake()->randomElement([
                'active',
                'inactive',
                'maintenance',
            ]),

            'speed_limit' => fake()->randomElement([
                30,
                50,
                70,
                90,
            ]),
        ];
    }
}
