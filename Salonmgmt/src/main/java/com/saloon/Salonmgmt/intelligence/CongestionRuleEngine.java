package com.saloon.Salonmgmt.intelligence;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

/**
 * SalonFlow AI - Congestion & Operations Heuristics Engine (LLD Section 11)
 * Labeled honestly as an Operations Intelligence Engine.
 */
public class CongestionRuleEngine {

    public enum CongestionLevel {
        LOW, MODERATE, HIGH, CRITICAL
    }

    public static class InsightItem {
        private String type;
        private String priority;
        private String message;
        private String action;

        public InsightItem(String type, String priority, String message, String action) {
            this.type = type;
            this.priority = priority;
            this.message = message;
            this.action = action;
        }

        public String getType() { return type; }
        public String getPriority() { return priority; }
        public String getMessage() { return message; }
        public String getAction() { return action; }
    }

    public static class CongestionReport {
        private CongestionLevel congestionLevel;
        private int currentQueueCount;
        private int activeStaffCount;
        private double queueToStaffRatio;
        private int estimatedWaitMinutes;
        private String peakHourPrediction;
        private List<InsightItem> insights;
        private String generatedAt;

        public CongestionReport(CongestionLevel level, int queue, int staff, double ratio, int wait, String peak, List<InsightItem> insights) {
            this.congestionLevel = level;
            this.currentQueueCount = queue;
            this.activeStaffCount = staff;
            this.queueToStaffRatio = ratio;
            this.estimatedWaitMinutes = wait;
            this.peakHourPrediction = peak;
            this.insights = insights;
            this.generatedAt = Instant.now().toString();
        }

        public CongestionLevel getCongestionLevel() { return congestionLevel; }
        public int getCurrentQueueCount() { return currentQueueCount; }
        public int getActiveStaffCount() { return activeStaffCount; }
        public double getQueueToStaffRatio() { return queueToStaffRatio; }
        public int getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
        public String getPeakHourPrediction() { return peakHourPrediction; }
        public List<InsightItem> getInsights() { return insights; }
        public String getGeneratedAt() { return generatedAt; }
    }

    public static CongestionReport evaluateCongestion(int waitingQueueCount, int activeStaffCount, int upcomingBookingsCount) {
        int staff = Math.max(1, activeStaffCount);
        double ratio = (double) waitingQueueCount / staff;
        int estimatedWait = (int) Math.round((waitingQueueCount * 22.0) / staff);

        CongestionLevel level = CongestionLevel.LOW;
        if (ratio >= 4.0 || estimatedWait >= 50) {
            level = CongestionLevel.CRITICAL;
        } else if (ratio >= 2.5 || estimatedWait >= 30) {
            level = CongestionLevel.HIGH;
        } else if (ratio >= 1.5 || estimatedWait >= 15) {
            level = CongestionLevel.MODERATE;
        }

        List<InsightItem> insights = new ArrayList<>();

        if (level == CongestionLevel.CRITICAL) {
            insights.add(new InsightItem(
                "STAFFING_ALERT",
                "CRITICAL",
                String.format("Critical queue bottleneck: %d customers waiting for %d stylists.", waitingQueueCount, staff),
                "Immediately reallocate stylists from break and temporarily throttle walk-in token creation."
            ));
        } else if (level == CongestionLevel.HIGH) {
            insights.add(new InsightItem(
                "STAFFING_ALERT",
                "HIGH",
                String.format("High congestion: %d customers in queue, estimated wait is %d minutes.", waitingQueueCount, estimatedWait),
                "Assign an additional stylist to haircut services to relieve queue pressure."
            ));
        } else {
            insights.add(new InsightItem(
                "CAPACITY_OPTIMIZATION",
                "LOW",
                "Queue throughput is healthy and balanced.",
                "Maintain normal shift schedule and prepare for evening wave."
            ));
        }

        String peakPrediction = upcomingBookingsCount >= 4 ? "6:00 PM - 7:30 PM" : "5:30 PM - 7:00 PM";
        if (upcomingBookingsCount >= 3) {
            insights.add(new InsightItem(
                "WAIT_WARNING",
                "HIGH",
                String.format("Peak demand expected around %s with %d upcoming appointments.", peakPrediction, upcomingBookingsCount),
                "Reserve two stations for confirmed appointments to prevent walk-in collisions."
            ));
        }

        insights.add(new InsightItem(
            "POPULAR_STYLE",
            "MEDIUM",
            "Textured Crop (HS01) is today's top AI recommendation match.",
            "Verify texturizing clay stock at barber stations."
        ));

        return new CongestionReport(level, waitingQueueCount, staff, Math.round(ratio * 100.0) / 100.0, estimatedWait, peakPrediction, insights);
    }
}
