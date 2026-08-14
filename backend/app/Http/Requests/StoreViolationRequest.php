<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreViolationRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'vehicle_id' => [
                'required',
                Rule::exists('vehicles', 'id')
                    ->whereNull('deleted_at'),
            ],

            'camera_id' => [
                'required',
                Rule::exists('cameras', 'id')
                    ->whereNull('deleted_at'),
            ],

            'violation_type_id' => [
                'required',
                Rule::exists('violation_types', 'id')
                    ->whereNull('deleted_at'),
            ],

            'speed' => [
                'nullable',
                'integer',
                'min:0',
                'max:500',
            ],

            'speed_limit' => [
                'nullable',
                'integer',
                'min:1',
                'max:300',
            ],

            'latitude' => [
                'nullable',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'nullable',
                'numeric',
                'between:-180,180',
            ],

            'image_path' => [
                'nullable',
                'string',
                'max:255',
            ],

            'status' => [
                'required',
                Rule::in([
                    'detected',
                    'reviewed',
                    'approved',
                ]),
            ],

            'detected_at' => [
                'required',
                'date',
            ],
        ];
    }
}
