package com.saloon.Salonmgmt.controller;

import com.saloon.Salonmgmt.dto.*;
import com.saloon.Salonmgmt.service.SalonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/salons")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class SalonController {

    private final SalonService salonService;

    @PostMapping
    public ResponseEntity<ApiResponse<SalonResponse>> createSalon(@RequestBody SalonRequest request) {
        try {
            SalonResponse response = salonService.createSalon(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("Salon created successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create salon: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<SalonResponse>>> getAllSalons() {
        try {
            List<SalonResponse> salons = salonService.getAllSalons();
            return ResponseEntity.ok(ApiResponse.ok("Salons retrieved successfully", salons));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve salons: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<SalonResponse>> getSalonById(@PathVariable UUID id) {
        try {
            SalonResponse salon = salonService.getSalonById(id);
            return ResponseEntity.ok(ApiResponse.ok("Salon retrieved successfully", salon));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve salon: " + e.getMessage()));
        }
    }

    @GetMapping("/city/{city}")
    public ResponseEntity<ApiResponse<List<SalonResponse>>> getSalonsByCity(@PathVariable String city) {
        try {
            List<SalonResponse> salons = salonService.getSalonsByCity(city);
            return ResponseEntity.ok(ApiResponse.ok("Salons in " + city + " retrieved successfully", salons));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve salons by city: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<SalonResponse>> updateSalon(
            @PathVariable UUID id,
            @RequestBody SalonRequest request) {
        try {
            SalonResponse updated = salonService.updateSalon(id, request);
            return ResponseEntity.ok(ApiResponse.ok("Salon updated successfully", updated));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update salon: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<SalonScheduleResponse>> updateSchedule(
            @PathVariable UUID id,
            @RequestBody SalonScheduleRequest request) {
        try {
            SalonScheduleResponse response = salonService.updateSchedule(id, request);
            return ResponseEntity.ok(ApiResponse.ok("Salon schedule updated successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update schedule: " + e.getMessage()));
        }
    }

    @PostMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<SalonScheduleResponse>> registerSchedule(
            @PathVariable UUID id,
            @RequestBody SalonScheduleRequest request) {
        return updateSchedule(id, request);
    }

    @GetMapping("/{id}/schedule")
    public ResponseEntity<ApiResponse<SalonScheduleResponse>> getSchedule(@PathVariable UUID id) {
        try {
            SalonScheduleResponse response = salonService.getSchedule(id);
            return ResponseEntity.ok(ApiResponse.ok("Salon schedule retrieved successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve schedule: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSalon(@PathVariable UUID id) {
        try {
            salonService.deleteSalon(id);
            return ResponseEntity.ok(ApiResponse.ok("Salon deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete salon: " + e.getMessage()));
        }
    }
}
