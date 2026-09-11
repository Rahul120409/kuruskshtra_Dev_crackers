package com.saloon.Salonmgmt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSlotSuggestionDto {
    private String time; // e.g. "11:30 AM"
    private String badge; // e.g. "⭐ Least Crowded", "⚡ Fastest Service", "🕒 Prime Afternoon"
    private String trafficLevel; // "LOW", "MEDIUM", "HIGH"
    private Integer estimatedWaitTimeMinutes;
    private String reason;
}
