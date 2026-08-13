<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;

class ViolationType extends Model
{
    //
    use SoftDeletes;

    public function violations(): HasMany
    {
        return $this->hasMany(Violation::class);
    }
}
