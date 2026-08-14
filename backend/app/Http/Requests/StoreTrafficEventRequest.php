<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreTrafficEventRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'camera_id' => [
                'nullable',
                Rule::exists('cameras', 'id')
                    ->whereNull('deleted_at'),
            ],

            'type' => [
                'required',
                Rule::in([
                    'ACCIDENT',
                    'ROAD_WORK',
                    'VEHICLE_BREAKDOWN',
                    'ROAD_CLOSED',
                    'TRAFFIC_JAM',
                ]),
            ],

            'title' => [
                'required',
                'string',
                'max:255',
            ],

            'description' => [
                'nullable',
                'string',
            ],

            'severity' => [
                'required',
                Rule::in([
                    'low',
                    'medium',
                    'high',
                    'critical',
                ]),
            ],

            'status' => [
                'required',
                Rule::in([
                    'active',
                    'resolved',
                ]),
            ],

            'latitude' => [
                'required',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'required',
                'numeric',
                'between:-180,180',
            ],

            'occurred_at' => [
                'required',
                'date',
            ],

            'resolved_at' => [
                'nullable',
                'date',
                'after_or_equal:occurred_at',
            ],
        ];
    }
}
