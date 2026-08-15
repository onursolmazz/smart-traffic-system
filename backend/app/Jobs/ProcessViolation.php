<?php

namespace App\Jobs;

use App\Models\Alert;
use App\Models\Violation;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Log;

class ProcessViolation implements ShouldQueue
{
    use Queueable;

    public int $tries = 3;

    public int $timeout = 30;

    public function __construct(
        public int $violationId
    ) {}

    public function handle(): void
    {
        $violation = Violation::query()
            ->with([
                'vehicle',
                'camera',
                'violationType',
            ])
            ->find($this->violationId);

        if (!$violation) {
            return;
        }

        $typeCode = $violation->violationType?->code;

        $severity = 'low';

        $title = 'Yeni Trafik İhlali';

        $message = sprintf(
            '%s plakalı araç için %s ihlali tespit edildi.',
            $violation->vehicle?->plate ?? 'Bilinmeyen',
            $violation->violationType?->name ?? 'trafik'
        );

        if (
            $typeCode === 'SPEED' &&
            $violation->speed &&
            $violation->speed_limit &&
            $violation->speed_limit > 0
        ) {
            $excessPercentage = (
                (
                    $violation->speed -
                    $violation->speed_limit
                ) /
                $violation->speed_limit
            ) * 100;

            if ($excessPercentage >= 40) {
                $severity = 'critical';
            } elseif ($excessPercentage >= 20) {
                $severity = 'high';
            } elseif ($excessPercentage >= 10) {
                $severity = 'medium';
            } else {
                $severity = 'low';
            }

            $title = 'Hız Limiti Aşıldı';

            $message = sprintf(
                '%s plakalı araç %s kamerasında %d km/h hızla tespit edildi. Limit %d km/h. Aşım oranı: %%%.1f.',
                $violation->vehicle?->plate ?? 'Bilinmeyen',
                $violation->camera?->code ?? 'Bilinmeyen',
                $violation->speed,
                $violation->speed_limit,
                $excessPercentage
            );
        }

        if ($typeCode === 'RED_LIGHT') {
            $severity = 'high';
            $title = 'Kırmızı Işık İhlali';

            $message = sprintf(
                '%s plakalı araç %s kamerasında kırmızı ışık ihlali yaptı.',
                $violation->vehicle?->plate ?? 'Bilinmeyen',
                $violation->camera?->code ?? 'Bilinmeyen'
            );
        }

        if ($typeCode === 'WRONG_WAY') {
            $severity = 'critical';
            $title = 'Ters Yön İhlali';

            $message = sprintf(
                '%s plakalı araç %s kamerasında ters yönde tespit edildi.',
                $violation->vehicle?->plate ?? 'Bilinmeyen',
                $violation->camera?->code ?? 'Bilinmeyen'
            );
        }

        if ($typeCode === 'ILLEGAL_PARKING') {
            $severity = 'medium';
            $title = 'Hatalı Park İhlali';

            $message = sprintf(
                '%s plakalı araç %s kamerasında hatalı park etmiş olarak tespit edildi.',
                $violation->vehicle?->plate ?? 'Bilinmeyen',
                $violation->camera?->code ?? 'Bilinmeyen'
            );
        }

        Alert::firstOrCreate(
            [
                'violation_id' => $violation->id,
            ],
            [
                'title' => $title,
                'message' => $message,
                'severity' => $severity,
            ],
        );

        Log::info(
            'Traffic violation processed.',
            [
                'violation_id' => $violation->id,
                'vehicle_plate' => $violation->vehicle?->plate,
                'camera_code' => $violation->camera?->code,
                'violation_type' => $typeCode,
                'severity' => $severity,
            ],
        );
    }
}
