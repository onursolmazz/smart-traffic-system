<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class CameraFilterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'search' => [
                'nullable',
                'string',
                'max:100',
            ],

            'status' => [
                'nullable',
                Rule::in([
                    'active',
                    'inactive',
                    'maintenance',
                ]),
            ],

            'speed_limit' => [
                'nullable',
                'integer',
                'min:1',
                'max:300',
            ],

            'per_page' => [
                'nullable',
                'integer',
                'min:1',
                'max:100',
            ],

            'sort_by' => [
                'nullable',
                Rule::in([
                    'id',
                    'name',
                    'code',
                    'status',
                    'speed_limit',
                    'created_at',
                ]),
            ],

            'sort_direction' => [
                'nullable',
                Rule::in([
                    'asc',
                    'desc',
                ]),
            ],
        ];
    }
}
