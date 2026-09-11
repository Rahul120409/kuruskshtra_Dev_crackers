package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.enums.BookingSource;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class JoinQueueRequest {
    private UUID salonId;
    private String customerName;
    private String customerPhone;
    private UUID userId;
    private BookingSource source;

    private UUID serviceId;
    private String serviceName;
    private Integer serviceDurationMinutes;

    private UUID staffId;
}
