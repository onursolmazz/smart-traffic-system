<?php

use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CameraController;
use App\Http\Controllers\Api\ViolationController;
use App\Http\Controllers\Api\TrafficEventController;

Route::apiResource('vehicles', VehicleController::class);
Route::apiResource('cameras', CameraController::class);
Route::apiResource('violations',ViolationController::class);
Route::apiResource('traffic-events',TrafficEventController::class);