package com.saloon.Salonmgmt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentCheckInResponse {
    private AppointmentResponse appointment;
    private QueueTokenResponse queueToken;
}
