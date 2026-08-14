<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreVehicleRequest extends FormRequest
{
    /**
     * Determine if the user is authorized to make this request.
     */
    public function authorize(): bool
    {
        return true;
    }

    /**
     * Get the validation rules that apply to the request.
     *
     */
    public function rules(): array
    {
        return [
            'plate' => [
                'required',
                'string',
                'max:15',
                'unique:vehicles.plate',
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
