package com.saloon.Salonmgmt.controller;

import com.saloon.Salonmgmt.dto.ApiResponse;
import com.saloon.Salonmgmt.dto.StaffRequest;
import com.saloon.Salonmgmt.dto.StaffResponse;
import com.saloon.Salonmgmt.dto.StaffStatusRequest;
import com.saloon.Salonmgmt.entity.enums.StaffStatus;
import com.saloon.Salonmgmt.service.StaffService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/staff")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StaffController {

    private final StaffService staffService;

    @PostMapping
    public ResponseEntity<ApiResponse<StaffResponse>> createStaff(@RequestBody StaffRequest request) {
        try {
            StaffResponse response = staffService.createStaff(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("Staff created and role assigned successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create staff: " + e.getMessage()));
        }
    }

    @GetMapping
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getAllStaff(
            @RequestParam(required = false) UUID salonId) {
        try {
            List<StaffResponse> staffList = staffService.getAllStaff(salonId);
            return ResponseEntity.ok(ApiResponse.ok("Staff members retrieved successfully", staffList));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve staff: " + e.getMessage()));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> getStaffById(@PathVariable UUID id) {
        try {
            StaffResponse staff = staffService.getStaffById(id);
            return ResponseEntity.ok(ApiResponse.ok("Staff details retrieved successfully", staff));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve staff: " + e.getMessage()));
        }
    }

    @GetMapping("/salon/{salonId}")
    public ResponseEntity<ApiResponse<List<StaffResponse>>> getStaffBySalon(
            @PathVariable UUID salonId,
            @RequestParam(required = false) StaffStatus status) {
        try {
            List<StaffResponse> list;
            if (status != null) {
                list = staffService.getStaffBySalonAndStatus(salonId, status);
            } else {
                list = staffService.getAllStaff(salonId);
            }
            return ResponseEntity.ok(ApiResponse.ok("Salon staff retrieved successfully", list));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve salon staff: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaffStatus(
            @PathVariable UUID id,
            @RequestBody StaffStatusRequest request) {
        try {
            StaffResponse response = staffService.updateStaffStatus(id, request.getStatus());
            return ResponseEntity.ok(ApiResponse.ok("Staff status updated successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update staff status: " + e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<ApiResponse<StaffResponse>> updateStaff(
            @PathVariable UUID id,
            @RequestBody StaffRequest request) {
        try {
            StaffResponse response = staffService.updateStaff(id, request);
            return ResponseEntity.ok(ApiResponse.ok("Staff updated successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update staff: " + e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStaff(@PathVariable UUID id) {
        try {
            staffService.deleteStaff(id);
            return ResponseEntity.ok(ApiResponse.ok("Staff deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete staff: " + e.getMessage()));
        }
    }
}
