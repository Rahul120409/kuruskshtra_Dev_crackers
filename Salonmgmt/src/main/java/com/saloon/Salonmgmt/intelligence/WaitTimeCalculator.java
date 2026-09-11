package com.saloon.Salonmgmt.intelligence;

import java.util.List;

/**
 * SalonFlow AI - Authoritative Queue Wait-Time Engine (LLD Section 11)
 *
 * Implements:
 * Estimated Wait = (Sum of remaining durations of customers ahead) / (Available Staff Capacity)
 */
public class WaitTimeCalculator {

    public static class QueueCustomerSummary {
        private String tokenId;
        private int tokenNumber;
        private int durationMinutes;
        private String status; // WAITING, IN_SERVICE, CALLED

        public QueueCustomerSummary() {}

        public QueueCustomerSummary(String tokenId, int tokenNumber, int durationMinutes, String status) {
            this.tokenId = tokenId;
            this.tokenNumber = tokenNumber;
            this.durationMinutes = durationMinutes;
            this.status = status;
        }

        public String getTokenId() { return tokenId; }
        public int getTokenNumber() { return tokenNumber; }
        public int getDurationMinutes() { return durationMinutes; }
        public String getStatus() { return status; }
    }

    public static class WaitEstimateResult {
        private final int estimatedWaitMinutes;
        private final int customersAheadCount;
        private final int activeStaffCount;
        private final String formulaSummary;

        public WaitEstimateResult(int estimatedWaitMinutes, int customersAheadCount, int activeStaffCount, String formulaSummary) {
            this.estimatedWaitMinutes = estimatedWaitMinutes;
            this.customersAheadCount = customersAheadCount;
            this.activeStaffCount = activeStaffCount;
            this.formulaSummary = formulaSummary;
        }

        public int getEstimatedWaitMinutes() { return estimatedWaitMinutes; }
        public int getCustomersAheadCount() { return customersAheadCount; }
        public int getActiveStaffCount() { return activeStaffCount; }
        public String getFormulaSummary() { return formulaSummary; }
    }

    /**
     * Authoritative wait time calculation for Person 1's Spring Boot queue service.
     */
    public static WaitEstimateResult calculateWaitTime(List<QueueCustomerSummary> customersAhead, int activeStaffCount) {
        int staff = Math.max(1, activeStaffCount);

        if (customersAhead == null || customersAhead.isEmpty()) {
            return new WaitEstimateResult(0, 0, staff, "0 mins (Next in line)");
        }

        int totalMinutesAhead = 0;
        for (QueueCustomerSummary customer : customersAhead) {
            int duration = customer.getDurationMinutes() > 0 ? customer.getDurationMinutes() : 20;

            // If customer is already in service, count remaining time as approx 50%
            if ("IN_SERVICE".equalsIgnoreCase(customer.getStatus())) {
                duration = Math.max(5, (int) Math.round(duration * 0.5));
            }

            totalMinutesAhead += duration;
        }

        int estimatedWait = (int) Math.round((double) totalMinutesAhead / staff);
        String formula = String.format("(%d total mins work ahead) / %d active staff = %d mins",
                totalMinutesAhead, staff, estimatedWait);

        return new WaitEstimateResult(Math.max(1, estimatedWait), customersAhead.size(), staff, formula);
    }

    /**
     * Quick position estimate when customer list is not loaded into memory
     */
    public static WaitEstimateResult estimateByPosition(int position, int activeStaffCount, int avgServiceMinutes) {
        int customersAhead = Math.max(0, position - 1);
        int staff = Math.max(1, activeStaffCount);
        int avgDuration = avgServiceMinutes > 0 ? avgServiceMinutes : 22;

        if (customersAhead == 0) {
            return new WaitEstimateResult(0, 0, staff, "0 mins (Turn is now)");
        }

        int totalMinutes = customersAhead * avgDuration;
        int wait = (int) Math.round((double) totalMinutes / staff);
        String formula = String.format("(%d customers ahead * %dm) / %d staff = %d mins",
                customersAhead, avgDuration, staff, wait);

        return new WaitEstimateResult(Math.max(1, wait), customersAhead, staff, formula);
    }
}
