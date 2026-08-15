<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class Alert extends Model
{
    use SoftDeletes;

    protected $fillable = [
        'violation_id',
        'title',
        'message',
        'severity',
        'read_at',
    ];

    protected function casts(): array
    {
        return [
            'read_at' => 'datetime',
        ];
    }

    public function violation(): BelongsTo
    {
        return $this->belongsTo(Violation::class);
    }
}
