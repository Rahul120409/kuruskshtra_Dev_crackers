package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.enums.BookingSource;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentRequest {

    private UUID salonId;
    private UUID userId;
    private UUID customerId; // alias for userId

    private String customerName;
    private String customerPhone;
    private String customerEmail;

    private UUID serviceId;
    private String serviceName;
    private Double servicePrice;
    private Integer serviceDurationMinutes;

    private UUID staffId;
    private String staffName;

    private LocalDate appointmentDate;
    private String appointmentTime; // e.g. "10:30 AM"

    private BookingSource bookingSource;
    private String notes;

    public UUID getEffectiveUserId() {
        if (userId != null) return userId;
        return customerId;
    }
}
