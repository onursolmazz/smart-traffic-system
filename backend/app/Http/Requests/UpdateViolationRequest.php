<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateViolationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => [
                'sometimes',
                'required',
                Rule::exists('vehicles', 'id')
                    ->whereNull('deleted_at'),
            ],

            'camera_id' => [
                'sometimes',
                'required',
                Rule::exists('cameras', 'id')
                    ->whereNull('deleted_at'),
            ],

            'violation_type_id' => [
                'sometimes',
                'required',
                Rule::exists('violation_types', 'id')
                    ->whereNull('deleted_at'),
            ],

            'speed' => [
                'sometimes',
                'nullable',
                'integer',
                'min:0',
                'max:500',
            ],

            'speed_limit' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
                'max:300',
            ],

            'latitude' => [
                'sometimes',
                'nullable',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'sometimes',
                'nullable',
                'numeric',
                'between:-180,180',
            ],

            'image_path' => [
                'sometimes',
                'nullable',
                'string',
                'max:255',
            ],

            'status' => [
                'sometimes',
                'required',
                Rule::in([
                    'detected',
                    'reviewed',
                    'approved',
                ]),
            ],

            'detected_at' => [
                'sometimes',
                'required',
                'date',
            ],
        ];
    }
}
