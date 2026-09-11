package com.saloon.Salonmgmt.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSlotSuggestionResponse {
    private UUID salonId;
    private String salonName;
    private LocalDate date;
    private List<AiSlotSuggestionDto> suggestedSlots;
    private String aiSummary;
}
