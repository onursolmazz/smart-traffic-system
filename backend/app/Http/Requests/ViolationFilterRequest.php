<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class ViolationFilterRequest extends FormRequest
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
                    'detected',
                    'reviewed',
                    'approved',
                ]),
            ],

            'type' => [
                'nullable',
                'string',
                Rule::exists('violation_types', 'code')
                    ->whereNull('deleted_at'),
            ],

            'camera_id' => [
                'nullable',
                'integer',
                Rule::exists('cameras', 'id')
                    ->whereNull('deleted_at'),
            ],

            'vehicle_id' => [
                'nullable',
                'integer',
                Rule::exists('vehicles', 'id')
                    ->whereNull('deleted_at'),
            ],

            'date_from' => [
                'nullable',
                'date_format:Y-m-d',
            ],

            'date_to' => [
                'nullable',
                'date_format:Y-m-d',
                'after_or_equal:date_from',
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
                    'speed',
                    'detected_at',
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
