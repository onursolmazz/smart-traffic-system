<?php

namespace App\Services;

use App\Models\Violation;
use Illuminate\Contracts\Pagination\LengthAwarePaginator;

class ViolationService
{
    public function paginate(int $perPage = 15): LengthAwarePaginator
    {
        return Violation::query()
            ->with([
                'vehicle',
                'camera',
                'violationType',
            ])
            ->latest('detected_at')
            ->paginate($perPage);
    }

    public function loadRelations(Violation $violation): Violation
    {
        return $violation->load([
            'vehicle',
            'camera',
            'violationType',
        ]);
    }

    public function create(array $data): Violation
    {
        $violation = Violation::create($data);

        return $this->loadRelations($violation);
    }

    public function update(
        Violation $violation,
        array $data
    ): Violation {
        $violation->update($data);

        return $this->loadRelations(
            $violation->refresh()
        );
    }

    public function delete(Violation $violation): void
    {
        $violation->delete();
    }
}
