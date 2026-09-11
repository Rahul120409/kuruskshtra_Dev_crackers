package com.saloon.Salonmgmt.controller;

import com.saloon.Salonmgmt.dto.AiSlotSuggestionRequest;
import com.saloon.Salonmgmt.dto.AiSlotSuggestionResponse;
import com.saloon.Salonmgmt.dto.AiWaitTimeEstimationResponse;
import com.saloon.Salonmgmt.dto.ApiResponse;
import com.saloon.Salonmgmt.service.AiSalonService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class AiSalonController {

    private final AiSalonService aiSalonService;

    /**
     * SMART AI WAIT TIME ESTIMATOR
     * Calculates dynamic wait time based on queued customers, active stylists, service durations, and buffers.
     */
    @GetMapping("/estimate-wait")
    public ResponseEntity<ApiResponse<AiWaitTimeEstimationResponse>> estimateWaitTime(
            @RequestParam UUID salonId,
            @RequestParam(required = false, defaultValue = "30") Integer serviceDuration,
            @RequestParam(required = false) UUID staffId) {
        try {
            AiWaitTimeEstimationResponse response = aiSalonService.estimateWaitTime(salonId, serviceDuration, staffId);
            return ResponseEntity.ok(ApiResponse.ok("Wait time estimated successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to estimate wait time: " + e.getMessage()));
        }
    }

    /**
     * AI SMART BOOKING SLOT SUGGESTER
     * Suggests the least crowded, optimal booking windows based on salon operating schedule and existing load.
     */
    @PostMapping("/suggest-booking-slots")
    public ResponseEntity<ApiResponse<AiSlotSuggestionResponse>> suggestBookingSlots(
            @RequestBody AiSlotSuggestionRequest request) {
        try {
            AiSlotSuggestionResponse response = aiSalonService.suggestBookingSlots(request);
            return ResponseEntity.ok(ApiResponse.ok("Smart booking slots suggested successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.internalServerError().body(ApiResponse.error("Failed to suggest slots: " + e.getMessage()));
        }
    }
}
