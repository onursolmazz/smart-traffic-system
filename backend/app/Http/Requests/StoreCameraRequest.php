<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreCameraRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => [
                'required',
                'string',
                'max:150',
            ],

            'code' => [
                'required',
                'string',
                'max:50',
                'unique:cameras,code',
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

            'status' => [
                'required',
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
        ];
    }
}
