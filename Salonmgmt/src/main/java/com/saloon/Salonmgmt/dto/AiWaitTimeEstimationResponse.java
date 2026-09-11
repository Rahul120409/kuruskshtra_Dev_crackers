package com.saloon.Salonmgmt.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiWaitTimeEstimationResponse {
    private UUID salonId;
    private Integer estimatedWaitMinutes;
    private Integer totalWaitingCustomers;
    private Integer customersAhead;
    private Long activeStylistsCount;
    private Integer requestedServiceDuration;
    private String stylistName;
    private Double confidenceScore; // e.g. 0.95
    private String aiExplanation;
}
