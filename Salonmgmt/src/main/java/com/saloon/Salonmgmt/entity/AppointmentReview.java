package com.saloon.Salonmgmt.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "appointment_reviews")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentReview {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "customer_name")
    private String customerName;

    @Column(name = "appointment_id", nullable = false)
    private UUID appointmentId;

    @Column(name = "salon_id", nullable = false)
    private UUID salonId;

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(name = "staff_name")
    private String staffName;

    @Column(name = "rating", nullable = false)
    private Integer rating;

    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
