package com.saloon.Salonmgmt.controller;

import com.saloon.Salonmgmt.intelligence.CongestionRuleEngine;
import com.saloon.Salonmgmt.intelligence.WaitTimeCalculator;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/ai/intelligence")
@CrossOrigin(origins = "*")
public class SalonIntelligenceController {

    // ==========================================
    // 1. POST /api/ai/intelligence/wait-time
    // ==========================================
    @PostMapping("/wait-time")
    public ResponseEntity<Map<String, Object>> calculateWaitTime(@RequestBody(required = false) Map<String, Object> payload) {
        int activeStaff = 2;
        int position = 4;
        int avgService = 22;

        if (payload != null) {
            if (payload.get("activeStaffCount") != null) {
                try {
                    activeStaff = Integer.parseInt(payload.get("activeStaffCount").toString());
                } catch (Exception ignored) {}
            }
            if (payload.get("position") != null) {
                try {
                    position = Integer.parseInt(payload.get("position").toString());
                } catch (Exception ignored) {}
            }
            if (payload.get("avgServiceMinutes") != null) {
                try {
                    avgService = Integer.parseInt(payload.get("avgServiceMinutes").toString());
                } catch (Exception ignored) {}
            }
        }

        // Check if queueAhead list provided
        if (payload != null && payload.get("queueAhead") instanceof List) {
            List<?> rawList = (List<?>) payload.get("queueAhead");
            List<WaitTimeCalculator.QueueCustomerSummary> customers = new ArrayList<>();
            for (Object obj : rawList) {
                if (obj instanceof Map) {
                    Map<?, ?> item = (Map<?, ?>) obj;
                    String tokenId = item.get("tokenId") != null ? item.get("tokenId").toString() : "T-01";
                    int tokenNum = 1;
                    int dur = 20;
                    String status = item.get("status") != null ? item.get("status").toString() : "WAITING";
                    try {
                        if (item.get("tokenNumber") != null) tokenNum = Integer.parseInt(item.get("tokenNumber").toString());
                        if (item.get("durationMinutes") != null) dur = Integer.parseInt(item.get("durationMinutes").toString());
                    } catch (Exception ignored) {}
                    customers.add(new WaitTimeCalculator.QueueCustomerSummary(tokenId, tokenNum, dur, status));
                }
            }
            WaitTimeCalculator.WaitEstimateResult result = WaitTimeCalculator.calculateWaitTime(customers, activeStaff);
            Map<String, Object> resp = new HashMap<>();
            resp.put("estimatedWaitMinutes", result.getEstimatedWaitMinutes());
            resp.put("customersAheadCount", result.getCustomersAheadCount());
            resp.put("activeStaffCount", result.getActiveStaffCount());
            resp.put("formulaSummary", result.getFormulaSummary());
            resp.put("source", "Spring Boot Backend (Salonmgmt)");
            return ResponseEntity.ok(resp);
        }

        WaitTimeCalculator.WaitEstimateResult result = WaitTimeCalculator.estimateByPosition(position, activeStaff, avgService);
        Map<String, Object> resp = new HashMap<>();
        resp.put("estimatedWaitMinutes", result.getEstimatedWaitMinutes());
        resp.put("customersAheadCount", result.getCustomersAheadCount());
        resp.put("activeStaffCount", result.getActiveStaffCount());
        resp.put("formulaSummary", result.getFormulaSummary());
        resp.put("source", "Spring Boot Backend (Salonmgmt)");
        return ResponseEntity.ok(resp);
    }

    // ==========================================
    // 2. POST & GET /api/ai/intelligence/congestion
    // ==========================================
    @PostMapping("/congestion")
    public ResponseEntity<Map<String, Object>> evaluateCongestion(@RequestBody(required = false) Map<String, Object> payload) {
        int queueCount = 5;
        int activeStaff = 2;
        int upcomingBookings = 3;

        if (payload != null) {
            if (payload.get("currentQueueCount") != null) {
                try {
                    queueCount = Integer.parseInt(payload.get("currentQueueCount").toString());
                } catch (Exception ignored) {}
            } else if (payload.get("currentQueue") instanceof List) {
                queueCount = ((List<?>) payload.get("currentQueue")).size();
            }

            if (payload.get("activeStaffCount") != null) {
                try {
                    activeStaff = Integer.parseInt(payload.get("activeStaffCount").toString());
                } catch (Exception ignored) {}
            }

            if (payload.get("upcomingAppointmentsCount") != null) {
                try {
                    upcomingBookings = Integer.parseInt(payload.get("upcomingAppointmentsCount").toString());
                } catch (Exception ignored) {}
            } else if (payload.get("upcomingBookingsCount") != null) {
                try {
                    upcomingBookings = Integer.parseInt(payload.get("upcomingBookingsCount").toString());
                } catch (Exception ignored) {}
            }
        }

        CongestionRuleEngine.CongestionReport report = CongestionRuleEngine.evaluateCongestion(queueCount, activeStaff, upcomingBookings);

        Map<String, Object> resp = new HashMap<>();
        resp.put("congestionLevel", report.getCongestionLevel().name());
        resp.put("currentQueueCount", report.getCurrentQueueCount());
        resp.put("activeStaffCount", report.getActiveStaffCount());
        resp.put("queueToStaffRatio", report.getQueueToStaffRatio());
        resp.put("estimatedWaitMinutes", report.getEstimatedWaitMinutes());
        resp.put("peakHourPrediction", report.getPeakHourPrediction());
        resp.put("insights", report.getInsights());
        resp.put("generatedAt", report.getGeneratedAt());
        resp.put("source", "Spring Boot Backend (Salonmgmt)");

        return ResponseEntity.ok(resp);
    }

    @GetMapping("/congestion")
    public ResponseEntity<Map<String, Object>> getCongestionStatus() {
        CongestionRuleEngine.CongestionReport report = CongestionRuleEngine.evaluateCongestion(4, 2, 3);

        Map<String, Object> resp = new HashMap<>();
        resp.put("congestionLevel", report.getCongestionLevel().name());
        resp.put("currentQueueCount", report.getCurrentQueueCount());
        resp.put("activeStaffCount", report.getActiveStaffCount());
        resp.put("queueToStaffRatio", report.getQueueToStaffRatio());
        resp.put("estimatedWaitMinutes", report.getEstimatedWaitMinutes());
        resp.put("peakHourPrediction", report.getPeakHourPrediction());
        resp.put("insights", report.getInsights());
        resp.put("generatedAt", report.getGeneratedAt());
        resp.put("source", "Spring Boot Backend (Salonmgmt)");

        return ResponseEntity.ok(resp);
    }
}
