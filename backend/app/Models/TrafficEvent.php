<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\SoftDeletes;

class TrafficEvent extends Model
{
    use SoftDeletes;

    public function camera(): BelongsTo
    {
        return $this->belongsTo(Camera::class);
    }
}
