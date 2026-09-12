package com.saloon.Salonmgmt.dto;
import com.saloon.Salonmgmt.entity.Appointment;
import com.saloon.Salonmgmt.entity.enums.AppointmentStatus;
import com.saloon.Salonmgmt.entity.enums.BookingSource;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.NoArgsConstructor;
import lombok.Getter;
import lombok.Setter;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentResponse {

    private UUID id;
    private UUID salonId;
    private String salonName;
    private UUID userId;
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
    private String appointmentTime;
    private AppointmentStatus status;
    private BookingSource bookingSource;
    private String notes;
    private UUID queueTokenId;
    private Integer queueTokenNumber;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime lateTimestamp;
    private BigDecimal cancellationFee;
    private Integer rating;
    private String feedback;

    public static AppointmentResponse fromEntity(Appointment apt) {
        if (apt == null) return null;
        return AppointmentResponse.builder()
                .id(apt.getId())
                .salonId(apt.getSalonId())
                .salonName(apt.getSalonName())
                .userId(apt.getUserId())
                .customerName(apt.getCustomerName())
                .customerPhone(apt.getCustomerPhone())
                .customerEmail(apt.getCustomerEmail())
                .serviceId(apt.getServiceId())
                .serviceName(apt.getServiceName())
                .servicePrice(apt.getServicePrice())
                .serviceDurationMinutes(apt.getServiceDurationMinutes())
                .staffId(apt.getStaffId())
                .staffName(apt.getStaffName())
                .appointmentDate(apt.getAppointmentDate())
                .appointmentTime(apt.getAppointmentTime())
                .status(apt.getStatus())
                .bookingSource(apt.getBookingSource())
                .notes(apt.getNotes())
                .queueTokenId(apt.getQueueTokenId())
                .queueTokenNumber(apt.getQueueTokenNumber())
                .createdAt(apt.getCreatedAt())
                .updatedAt(apt.getUpdatedAt())
                .lateTimestamp(apt.getLateTimestamp())
                .cancellationFee(apt.getCancellationFee())
                .rating(apt.getRating())
                .feedback(apt.getFeedback())
                .build();
    }
}


