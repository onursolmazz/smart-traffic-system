<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class TrafficEventFilterRequest extends FormRequest
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
                'max:150',
            ],

            'status' => [
                'nullable',
                Rule::in([
                    'active',
                    'resolved',
                ]),
            ],

            'severity' => [
                'nullable',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                    'critical',
                ]),
            ],

            'type' => [
                'nullable',
                Rule::in([
                    'ACCIDENT',
                    'ROAD_WORK',
                    'VEHICLE_BREAKDOWN',
                    'ROAD_CLOSED',
                    'TRAFFIC_JAM',
                ]),
            ],

            'camera_id' => [
                'nullable',
                'integer',
                Rule::exists('cameras', 'id')
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
                    'type',
                    'severity',
                    'status',
                    'occurred_at',
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
