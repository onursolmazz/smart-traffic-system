<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleFactory extends Factory
{
    public function definition(): array
    {
        $cars = [
            'Toyota' => ['Corolla', 'Yaris'],
            'Renault' => ['Clio', 'Megane'],
            'BMW' => ['320i', '520i'],
            'Mercedes' => ['C180', 'E200'],
            'Honda' => ['Civic', 'City'],
            'Ford' => ['Focus', 'Puma'],
        ];

        $brand = fake()->randomElement(array_keys($cars));

        return [
            'plate' => strtoupper(fake()->unique()->bothify('## ??? ###')),
            'brand' => $brand,
            'model' => fake()->randomElement($cars[$brand]),
            'color' => fake()->randomElement([
                'White',
                'Black',
                'Gray',
                'Blue',
                'Red',
            ]),
            'year' => fake()->numberBetween(2005, 2026),
        ];
    }
}
