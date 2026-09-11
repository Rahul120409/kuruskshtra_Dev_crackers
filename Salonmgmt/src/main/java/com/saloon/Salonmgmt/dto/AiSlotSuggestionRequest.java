package com.saloon.Salonmgmt.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AiSlotSuggestionRequest {
    private UUID salonId;
    private LocalDate date;
    @Builder.Default
    private Integer serviceDurationMinutes = 30;
    private UUID preferredStaffId;
}
