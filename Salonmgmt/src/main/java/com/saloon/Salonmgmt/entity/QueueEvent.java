package com.saloon.Salonmgmt.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "queue_events")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueEvent {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    @Column(name = "token_id", nullable = false)
    private UUID tokenId;

    @Column(name = "salon_id", nullable = false)
    private UUID salonId;

    @Column(name = "token_number", nullable = false)
    private Integer tokenNumber;

    @Column(name = "event_type", nullable = false)
    private String eventType;

    @Column(name = "timestamp", nullable = false)
    private LocalDateTime timestamp;

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
    }
}
