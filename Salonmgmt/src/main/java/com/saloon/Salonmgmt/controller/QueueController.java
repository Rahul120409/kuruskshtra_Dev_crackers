package com.saloon.Salonmgmt.controller;

import com.saloon.Salonmgmt.dto.ApiResponse;
import com.saloon.Salonmgmt.dto.JoinQueueRequest;
import com.saloon.Salonmgmt.dto.LiveQueueBoardResponse;
import com.saloon.Salonmgmt.dto.QueueTokenResponse;
import com.saloon.Salonmgmt.service.QueueService;
import com.saloon.Salonmgmt.service.WhatsAppNotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/queue")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class QueueController {

    private final QueueService queueService;
    private final WhatsAppNotificationService whatsAppNotificationService;

    @PostMapping("/join")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> joinQueue(@RequestBody JoinQueueRequest request) {
        try {
            QueueTokenResponse response = queueService.joinQueue(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("Token generated successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to join queue: " + e.getMessage()));
        }
    }

    @GetMapping("/live/{salonId}")
    public ResponseEntity<ApiResponse<LiveQueueBoardResponse>> getLiveQueueBoard(@PathVariable UUID salonId) {
        try {
            LiveQueueBoardResponse board = queueService.getLiveQueueBoard(salonId);
            return ResponseEntity.ok(ApiResponse.ok("Live queue board retrieved", board));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve live queue board: " + e.getMessage()));
        }
    }

    @GetMapping("/token/{tokenId}")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> getTokenDetails(@PathVariable UUID tokenId) {
        try {
            QueueTokenResponse response = queueService.getTokenById(tokenId);
            return ResponseEntity.ok(ApiResponse.ok("Token details retrieved", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve token: " + e.getMessage()));
        }
    }

    @PutMapping("/{tokenId}/call")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> callToken(@PathVariable UUID tokenId) {
        try {
            QueueTokenResponse response = queueService.callToken(tokenId);
            return ResponseEntity.ok(ApiResponse.ok("Customer called to chair", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to call customer: " + e.getMessage()));
        }
    }

    @PutMapping("/{tokenId}/start")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> startService(
            @PathVariable UUID tokenId,
            @RequestParam(required = false) UUID staffId) {
        try {
            QueueTokenResponse response = queueService.startService(tokenId, staffId);
            return ResponseEntity.ok(ApiResponse.ok("Service started. Token is now ONGOING.", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to start service: " + e.getMessage()));
        }
    }

    @PutMapping("/{tokenId}/complete")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> completeService(@PathVariable UUID tokenId) {
        try {
            QueueTokenResponse response = queueService.completeService(tokenId);
            return ResponseEntity.ok(ApiResponse.ok("Service completed successfully. Queue updated.", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to complete service: " + e.getMessage()));
        }
    }

    @PutMapping("/{tokenId}/cancel")
    public ResponseEntity<ApiResponse<QueueTokenResponse>> cancelToken(@PathVariable UUID tokenId) {
        try {
            QueueTokenResponse response = queueService.cancelToken(tokenId);
            return ResponseEntity.ok(ApiResponse.ok("Token cancelled successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to cancel token: " + e.getMessage()));
        }
    }

    @PostMapping("/{tokenId}/notify")
    public ResponseEntity<ApiResponse<String>> notifyCustomer(
            @PathVariable UUID tokenId,
            @RequestParam(required = false) String message) {
        try {
            queueService.notifyTokenCustomer(tokenId, message);
            return ResponseEntity.ok(ApiResponse.ok("WhatsApp notification sent to customer", "Delivered"));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to send WhatsApp alert: " + e.getMessage()));
        }
    }

    @GetMapping("/test-whatsapp")
    public ResponseEntity<ApiResponse<String>> testWhatsAppDirect(
            @RequestParam String phone,
            @RequestParam(required = false) String apiKey,
            @RequestParam(required = false, defaultValue = "✂️ Test alert from LuxeTrim Salon backend: Your chair is ready!") String message) {
        String result = whatsAppNotificationService.sendTestWhatsApp(phone, apiKey, message);
        return ResponseEntity.ok(ApiResponse.ok("CallMeBot test request executed", result));
    }
}
