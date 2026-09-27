package com.saloon.Salonmgmt.controller;

import com.saloon.Salonmgmt.dto.ApiResponse;
import com.saloon.Salonmgmt.dto.CityRequest;
import com.saloon.Salonmgmt.dto.CityResponse;
import com.saloon.Salonmgmt.dto.StateRequest;
import com.saloon.Salonmgmt.dto.StateResponse;
import com.saloon.Salonmgmt.service.LocationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/locations")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class LocationController {

    private final LocationService locationService;

    // --- State Endpoints ---

    @PostMapping("/states")
    public ResponseEntity<ApiResponse<StateResponse>> createState(@RequestBody StateRequest request) {
        try {
            StateResponse response = locationService.createState(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("State created successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create state: " + e.getMessage()));
        }
    }

    @GetMapping("/states")
    public ResponseEntity<ApiResponse<List<StateResponse>>> getAllStates() {
        try {
            List<StateResponse> states = locationService.getAllStates();
            return ResponseEntity.ok(ApiResponse.ok("States retrieved successfully", states));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve states: " + e.getMessage()));
        }
    }

    @GetMapping("/states/{id}")
    public ResponseEntity<ApiResponse<StateResponse>> getStateById(@PathVariable UUID id) {
        try {
            StateResponse state = locationService.getStateById(id);
            return ResponseEntity.ok(ApiResponse.ok("State retrieved successfully", state));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve state: " + e.getMessage()));
        }
    }

    // --- City Endpoints ---

    @PostMapping("/cities")
    public ResponseEntity<ApiResponse<CityResponse>> createCity(@RequestBody CityRequest request) {
        try {
            CityResponse response = locationService.createCity(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("City created successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create city: " + e.getMessage()));
        }
    }

    @GetMapping("/cities")
    public ResponseEntity<ApiResponse<List<CityResponse>>> getAllCities() {
        try {
            List<CityResponse> cities = locationService.getAllCities();
            return ResponseEntity.ok(ApiResponse.ok("Cities retrieved successfully", cities));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve cities: " + e.getMessage()));
        }
    }

    @GetMapping("/cities/state/{stateId}")
    public ResponseEntity<ApiResponse<List<CityResponse>>> getCitiesByStateId(@PathVariable UUID stateId) {
        try {
            List<CityResponse> cities = locationService.getCitiesByStateId(stateId);
            return ResponseEntity.ok(ApiResponse.ok("Cities for state retrieved successfully", cities));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve cities for state: " + e.getMessage()));
        }
    }

    @GetMapping("/cities/state-code/{stateCode}")
    public ResponseEntity<ApiResponse<List<CityResponse>>> getCitiesByStateCode(@PathVariable String stateCode) {
        try {
            List<CityResponse> cities = locationService.getCitiesByStateCode(stateCode);
            return ResponseEntity.ok(ApiResponse.ok("Cities for state code retrieved successfully", cities));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve cities for state code: " + e.getMessage()));
        }
    }
}
