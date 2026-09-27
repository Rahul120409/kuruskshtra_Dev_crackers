package com.saloon.Salonmgmt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AvailableSlotDto {
    private String time;
    private boolean available;
    private String reason;
}
