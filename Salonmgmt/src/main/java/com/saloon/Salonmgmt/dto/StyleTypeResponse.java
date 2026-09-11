package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.StyleType;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StyleTypeResponse {
    private UUID id;
    private UUID salonId;
    private String name;
    private String code;
    private String description;
    private String imageUrl;
    private boolean isActive;
    private int specificStyleCount;
    private LocalDateTime createdAt;

    public static StyleTypeResponse fromEntity(StyleType styleType) {
        if (styleType == null) return null;
        return StyleTypeResponse.builder()
                .id(styleType.getId())
                .salonId(styleType.getSalonId())
                .name(styleType.getName())
                .code(styleType.getCode())
                .description(styleType.getDescription())
                .imageUrl(styleType.getImageUrl())
                .isActive(styleType.isActive())
                .specificStyleCount(styleType.getSpecificStyles() != null ? styleType.getSpecificStyles().size() : 0)
                .createdAt(styleType.getCreatedAt())
                .build();
    }
}
