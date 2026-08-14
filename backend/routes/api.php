<?php

use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CameraController;

Route::apiResource('vehicles', VehicleController::class);
Route::apiResource('cameras', CameraController::class);
