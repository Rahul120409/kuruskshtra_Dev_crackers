package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.enums.AppointmentStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentStatusUpdateRequest {
    private AppointmentStatus status;
}
