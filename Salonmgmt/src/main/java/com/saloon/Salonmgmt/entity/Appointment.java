package com.saloon.Salonmgmt.entity;

import com.saloon.Salonmgmt.entity.enums.AppointmentStatus;
import com.saloon.Salonmgmt.entity.enums.BookingSource;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointments")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Appointment {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "salon_id", nullable = false)
    private UUID salonId;

    @Column(name = "salon_name")
    private String salonName;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "customer_email")
    private String customerEmail;

    @Column(name = "service_id")
    private UUID serviceId;

    @Column(name = "service_name")
    private String serviceName;

    @Column(name = "service_price")
    private Double servicePrice;

    @Column(name = "service_duration_minutes")
    @Builder.Default
    private Integer serviceDurationMinutes = 30;

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(name = "staff_name")
    private String staffName;

    @Column(name = "appointment_date", nullable = false)
    private LocalDate appointmentDate;

    @Column(name = "appointment_time", nullable = false)
    private String appointmentTime; // e.g. "10:30 AM", "04:00 PM"

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private AppointmentStatus status = AppointmentStatus.CONFIRMED;

    @Enumerated(EnumType.STRING)
    @Column(name = "booking_source", nullable = false)
    @Builder.Default
    private BookingSource bookingSource = BookingSource.ONLINE;

    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;

    @Column(name = "queue_token_id")
    private UUID queueTokenId;

    @Column(name = "queue_token_number")
    private Integer queueTokenNumber;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
        if (this.status == null) {
            this.status = AppointmentStatus.CONFIRMED;
        }
        if (this.bookingSource == null) {
            this.bookingSource = BookingSource.ONLINE;
        }
        if (this.serviceDurationMinutes == null) {
            this.serviceDurationMinutes = 30;
        }
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }
}
