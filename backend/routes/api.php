<?php

use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\CameraController;
use App\Http\Controllers\Api\ViolationController;
use App\Http\Controllers\Api\TrafficEventController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\ViolationTypeController;
use App\Http\Controllers\Api\AlertController;

Route::apiResource('vehicles', VehicleController::class);
Route::apiResource('cameras', CameraController::class);
Route::apiResource('violations', ViolationController::class);
Route::apiResource('traffic-events', TrafficEventController::class);
Route::get('dashboard',[DashboardController::class, 'index']);
Route::get('violation-types',[ViolationTypeController::class, 'index']);

Route::get('/alerts', [
    AlertController::class,
    'index',
]);

Route::patch('/alerts/read-all', [
    AlertController::class,
    'markAllAsRead',
]);

Route::patch('/alerts/{alert}/read', [
    AlertController::class,
    'markAsRead',
]);