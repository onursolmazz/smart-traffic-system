<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class UpdateCameraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'sometimes',
                'required',
                'string',
                'max:150',
            ],

            'code' => [
                'sometimes',
                'required',
                'string',
                'max:50',

                Rule::unique('cameras', 'code')
                    ->ignore($this->route('camera')),
            ],

            'latitude' => [
                'sometimes',
                'required',
                'numeric',
                'between:-90,90',
            ],

            'longitude' => [
                'sometimes',
                'required',
                'numeric',
                'between:-180,180',
            ],

            'status' => [
                'sometimes',
                'required',
                Rule::in([
                    'active',
                    'inactive',
                    'maintenance',
                ]),
            ],

            'speed_limit' => [
                'sometimes',
                'nullable',
                'integer',
                'min:1',
                'max:300',
            ],
        ];
    }
}
