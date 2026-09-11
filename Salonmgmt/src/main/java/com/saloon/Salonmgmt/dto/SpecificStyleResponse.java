package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.SpecificStyle;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecificStyleResponse {
    private UUID id;
    private UUID styleTypeId;
    private String styleTypeName;
    private String styleTypeCode;
    private String name;
    private String code;
    private String description;
    private Double price;
    private Integer durationMinutes;
    private String imageUrl;
    private String suitableFaceShapes;
    private String suitableHairTypes;
    private String gender;
    private boolean isActive;
    private LocalDateTime createdAt;

    public static SpecificStyleResponse fromEntity(SpecificStyle style) {
        if (style == null) return null;
        return SpecificStyleResponse.builder()
                .id(style.getId())
                .styleTypeId(style.getStyleType() != null ? style.getStyleType().getId() : null)
                .styleTypeName(style.getStyleType() != null ? style.getStyleType().getName() : null)
                .styleTypeCode(style.getStyleType() != null ? style.getStyleType().getCode() : null)
                .name(style.getName())
                .code(style.getCode())
                .description(style.getDescription())
                .price(style.getPrice())
                .durationMinutes(style.getDurationMinutes())
                .imageUrl(style.getImageUrl())
                .suitableFaceShapes(style.getSuitableFaceShapes())
                .suitableHairTypes(style.getSuitableHairTypes())
                .gender(style.getGender())
                .isActive(style.isActive())
                .createdAt(style.getCreatedAt())
                .build();
    }
}
