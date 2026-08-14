<?php

use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CameraController;
use App\Http\Controllers\Api\ViolationController;


Route::apiResource('vehicles', VehicleController::class);
Route::apiResource('cameras', CameraController::class);
Route::apiResource('violations',ViolationController::class);