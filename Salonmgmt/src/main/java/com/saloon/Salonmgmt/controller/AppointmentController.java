package com.saloon.Salonmgmt.controller;

import com.saloon.Salonmgmt.dto.*;
import com.saloon.Salonmgmt.entity.AppointmentReview;
import com.saloon.Salonmgmt.entity.enums.AppointmentStatus;
import com.saloon.Salonmgmt.service.AppointmentService;
import lombok.RequiredArgsConstructor;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/appointments")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AppointmentController {

    private final AppointmentService appointmentService;

    @PostMapping
    public ResponseEntity<ApiResponse<AppointmentResponse>> createAppointment(@RequestBody AppointmentRequest request) {
        try {
            AppointmentResponse response = appointmentService.createAppointment(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("Appointment booked successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to book appointment: " + e.getMessage()));
        }
    }

    /**
     * SALON PANEL: Shows all appointments for the salon.
     * Optional filters: ?date=2026-09-12&status=CONFIRMED
     */
    @GetMapping("/salon/{salonId}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointmentsBySalon(
            @PathVariable UUID salonId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date,
            @RequestParam(required = false) AppointmentStatus status) {
        try {
            List<AppointmentResponse> response = appointmentService.getAppointmentsBySalon(salonId, date, status);
            return ResponseEntity.ok(ApiResponse.ok("Salon appointments retrieved successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve salon appointments: " + e.getMessage()));
        }
    }

    /**
     * USER PANEL: Shows all appointments for a specific customer/user.
     */
    @GetMapping("/user/{userId}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointmentsByUser(@PathVariable UUID userId) {
        try {
            List<AppointmentResponse> response = appointmentService.getAppointmentsByUser(userId);
            return ResponseEntity.ok(ApiResponse.ok("User appointments retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve user appointments: " + e.getMessage()));
        }
    }

    /**
     * USER PANEL (Alias): Shows all appointments for a customer.
     */
    @GetMapping("/customer/{customerId}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointmentsByCustomer(@PathVariable UUID customerId) {
        return getAppointmentsByUser(customerId);
    }

    /**
     * Lookup appointments by customer phone number
     */
    @GetMapping("/phone/{phone}")
    public ResponseEntity<ApiResponse<List<AppointmentResponse>>> getAppointmentsByPhone(@PathVariable String phone) {
        try {
            List<AppointmentResponse> response = appointmentService.getAppointmentsByPhone(phone);
            return ResponseEntity.ok(ApiResponse.ok("Appointments retrieved successfully", response));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve appointments: " + e.getMessage()));
        }
    }

    /**
     * Get single appointment details by ID
     */
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<AppointmentResponse>> getAppointmentById(@PathVariable UUID id) {
        try {
            AppointmentResponse response = appointmentService.getAppointmentById(id);
            return ResponseEntity.ok(ApiResponse.ok("Appointment retrieved successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve appointment: " + e.getMessage()));
        }
    }

    /**
     * Update appointment status (CONFIRMED, CANCELLED, COMPLETED)
     */
    @PutMapping("/{id}/status")
    public ResponseEntity<ApiResponse<AppointmentResponse>> updateAppointmentStatus(
            @PathVariable UUID id,
            @RequestBody AppointmentStatusUpdateRequest request) {
        try {
            AppointmentResponse response = appointmentService.updateAppointmentStatus(id, request.getStatus());
            return ResponseEntity.ok(ApiResponse.ok("Appointment status updated successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update status: " + e.getMessage()));
        }
    }

    /**
     * CHECK-IN: Customer arrives at the salon! Converts appointment to live queue token.
     */
    @PostMapping("/{id}/check-in")
    public ResponseEntity<ApiResponse<AppointmentCheckInResponse>> checkInAppointment(@PathVariable UUID id) {
        try {
            AppointmentCheckInResponse response = appointmentService.checkInAppointment(id);
            return ResponseEntity.ok(ApiResponse.ok("Check-in successful! Joined live queue", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to check in: " + e.getMessage()));
        }
    }

    /**
     * STYLIST SLOT DISCOVERY: Get available booking slots for a stylist/salon on a date
     */
    @GetMapping("/available-slots")
    public ResponseEntity<ApiResponse<List<AvailableSlotDto>>> getAvailableSlots(
            @RequestParam UUID salonId,
            @RequestParam(required = false) UUID staffId,
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        try {
            List<AvailableSlotDto> slots = appointmentService.getAvailableSlots(salonId, staffId, date);
            return ResponseEntity.ok(ApiResponse.ok("Available slots retrieved successfully", slots));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve slots: " + e.getMessage()));
        }
    }

    /**
     * Submit rating and feedback for an appointment (saved in separate appointment_reviews table)
     */
    @PostMapping("/{id}/rating")
    public ResponseEntity<ApiResponse<AppointmentResponse>> rateAppointment(
            @PathVariable UUID id,
            @RequestBody AppointmentRatingRequest request) {
        try {
            AppointmentResponse response = appointmentService.submitRating(
                    id,
                    request.getRating(),
                    request.getEffectiveMessage(),
                    request.getUserId()
            );
            return ResponseEntity.ok(ApiResponse.ok("Rating and feedback saved successfully to reviews table", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to submit rating: " + e.getMessage()));
        }
    }

    /**
     * SALON PANEL: Get all customer ratings and reviews from the separate appointment_reviews table
     */
    @GetMapping("/salon/{salonId}/reviews")
    public ResponseEntity<ApiResponse<List<AppointmentReview>>> getSalonReviews(@PathVariable UUID salonId) {
        try {
            List<AppointmentReview> reviews = appointmentService.getReviewsBySalon(salonId);
            return ResponseEntity.ok(ApiResponse.ok("Salon reviews retrieved successfully", reviews));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve salon reviews: " + e.getMessage()));
        }
    }

    /**
     * Mark an appointment as LATE
     */
    @PostMapping("/{id}/late")
    public ResponseEntity<ApiResponse<AppointmentResponse>> markAppointmentLate(@PathVariable UUID id) {
        try {
            AppointmentResponse response = appointmentService.markAppointmentLate(id);
            return ResponseEntity.ok(ApiResponse.ok("Appointment marked as late", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to mark appointment as late: " + e.getMessage()));
        }
    }

    /**
     * Cancel an appointment (calculates cancellation fee if applicable)
     */
    @PostMapping("/{id}/cancel")
    public ResponseEntity<ApiResponse<AppointmentResponse>> cancelAppointment(@PathVariable UUID id) {
        try {
            AppointmentResponse response = appointmentService.cancelAppointment(id);
            return ResponseEntity.ok(ApiResponse.ok("Appointment cancelled successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to cancel appointment: " + e.getMessage()));
        }
    }
}
