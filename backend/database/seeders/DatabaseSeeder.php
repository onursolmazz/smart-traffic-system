<?php

namespace Database\Seeders;

use App\Models\Camera;
use App\Models\TrafficEvent;
use App\Models\Vehicle;
use App\Models\Violation;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {


        $this->call([
            ViolationTypeSeeder::class,
        ]);

        Vehicle::factory()
            ->count(50)
            ->create();

        Camera::factory()
            ->count(20)
            ->create();

        Violation::factory()
            ->count(100)
            ->create();

        TrafficEvent::factory()
            ->count(30)
            ->create();
    }
}
