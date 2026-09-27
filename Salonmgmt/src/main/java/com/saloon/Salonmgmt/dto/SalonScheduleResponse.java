package com.saloon.Salonmgmt.dto;

import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalonScheduleResponse {
    private UUID salonId;
    private String salonName;
    private List<DayScheduleDto> weeklySchedule;
    private String status;
    private LocalDateTime updatedAt;
}
