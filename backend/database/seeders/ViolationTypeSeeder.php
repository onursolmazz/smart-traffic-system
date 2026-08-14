<?php

namespace Database\Seeders;

use App\Models\ViolationType;
use Illuminate\Database\Seeder;

class ViolationTypeSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        $types = [
            [
                'name' => 'Hız İhlali',
                'code' => 'SPEED',
                'description' => 'Belirlenen hız sınırının aşılması.',
            ],
            [
                'name' => 'Kırmızı Işık İhlali',
                'code' => 'RED_LIGHT',
                'description' => 'Kırmızı ışıkta geçiş yapılması.',
            ],
            [
                'name' => 'Ters Yön',
                'code' => 'WRONG_WAY',
                'description' => 'Aracın ters yönde ilerlemesi.',
            ],
            [
                'name' => 'Yasak Park',
                'code' => 'ILLEGAL_PARKING',
                'description' => 'Yasak alana park edilmesi.',
            ],
        ];

        foreach ($types as $type) {
            ViolationType::updateOrCreate(
                ['code' => $type['code']],
                $type
            );
        }
    }
}
