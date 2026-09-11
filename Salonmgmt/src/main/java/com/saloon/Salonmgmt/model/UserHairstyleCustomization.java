package com.saloon.Salonmgmt.model;

import jakarta.persistence.*;
import lombok.*;
import java.time.Instant;

@Entity
@Table(name = "user_hairstyle_customizations")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserHairstyleCustomization {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "session_id")
    private String sessionId;

    private String gender;

    @Column(name = "face_shape")
    private String faceShape;

    @Column(name = "hair_type")
    private String hairType;

    @Column(name = "hair_density")
    private String hairDensity;

    @Column(name = "hairstyle_id")
    private String hairstyleId;

    @Column(name = "hairstyle_name")
    private String hairstyleName;

    @Column(name = "hair_color")
    private String hairColor;

    @Column(name = "hair_top")
    private Integer hairTop;

    @Column(name = "hair_scale")
    private Integer hairScale;

    @Column(name = "match_score")
    private Integer matchScore;

    @Column(name = "original_image", columnDefinition = "TEXT")
    private String originalImage;

    @Column(name = "customized_image", columnDefinition = "TEXT")
    private String customizedImage;

    @Column(name = "processing_time_ms")
    private Integer processingTimeMs;

    @Column(name = "created_at")
    private Instant createdAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) {
            createdAt = Instant.now();
        }
    }
}
