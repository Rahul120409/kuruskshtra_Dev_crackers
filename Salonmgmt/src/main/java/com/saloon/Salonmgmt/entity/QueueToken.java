package com.saloon.Salonmgmt.entity;

import com.saloon.Salonmgmt.entity.enums.BookingSource;
import com.saloon.Salonmgmt.entity.enums.QueueStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(
    name = "queue_tokens",
    uniqueConstraints = {
        @UniqueConstraint(columnNames = {"salon_id", "queue_date", "token_number"})
    }
)
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueToken {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "salon_id", nullable = false)
    private UUID salonId;

    @Column(name = "queue_date", nullable = false)
    private LocalDate queueDate;

    @Column(name = "token_number", nullable = false)
    private Integer tokenNumber;

    @Enumerated(EnumType.STRING)
    @Column(name = "source", nullable = false)
    @Builder.Default
    private BookingSource source = BookingSource.ONLINE;

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "customer_name", nullable = false)
    private String customerName;

    @Column(name = "customer_phone")
    private String customerPhone;

    @Column(name = "service_id")
    private UUID serviceId;

    @Column(name = "service_name")
    private String serviceName;

    @Column(name = "service_duration_minutes")
    @Builder.Default
    private Integer serviceDurationMinutes = 30;

    @Column(name = "staff_id")
    private UUID staffId;

    @Column(name = "staff_name")
    private String staffName;

    @Enumerated(EnumType.STRING)
    @Column(name = "status", nullable = false)
    @Builder.Default
    private QueueStatus status = QueueStatus.WAITING;

    @Column(name = "position")
    private Integer position;

    @Column(name = "estimated_wait_minutes")
    private Integer estimatedWaitMinutes;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private LocalDateTime joinedAt;

    @Column(name = "called_at")
    private LocalDateTime calledAt;

    @Column(name = "started_at")
    private LocalDateTime startedAt;

    @Column(name = "completed_at")
    private LocalDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        if (this.queueDate == null) {
            this.queueDate = LocalDate.now();
        }
        if (this.joinedAt == null) {
            this.joinedAt = LocalDateTime.now();
        }
        if (this.status == null) {
            this.status = QueueStatus.WAITING;
        }
        if (this.source == null) {
            this.source = BookingSource.ONLINE;
        }
        if (this.serviceDurationMinutes == null) {
            this.serviceDurationMinutes = 30;
        }
    }
}
