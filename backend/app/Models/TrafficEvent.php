<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrafficEvent extends Model
{
    use SoftDeletes, HasFactory;

    protected $fillable = [
        'camera_id',
        'type',
        'title',
        'description',
        'severity',
        'status',
        'latitude',
        'longitude',
        'occurred_at',
        'resolved_at',
    ];

    protected function casts(): array
    {
        return [
            'occurred_at' => 'datetime',
            'resolved_at' => 'datetime',
        ];
    }
    public function camera(): BelongsTo
    {
        return $this->belongsTo(Camera::class);
    }
}
