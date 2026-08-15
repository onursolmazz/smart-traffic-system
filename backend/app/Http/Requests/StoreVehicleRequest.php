<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreVehicleRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'plate' => [
                'required',
                'string',
                'max:20',
                Rule::unique('vehicles', 'plate'),
            ],

            'brand' => [
                'nullable',
                'string',
                'max:100',
            ],

            'model' => [
                'nullable',
                'string',
                'max:100',
            ],

            'color' => [
                'nullable',
                'string',
                'max:50',
            ],

            'year' => [
                'nullable',
                'integer',
                'min:1900',
                'max:2100',
            ],
        ];
    }
}
