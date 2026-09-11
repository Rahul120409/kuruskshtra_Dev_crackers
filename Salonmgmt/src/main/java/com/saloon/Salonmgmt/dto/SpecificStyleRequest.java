package com.saloon.Salonmgmt.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SpecificStyleRequest {
    private UUID styleTypeId;
    private String styleTypeCode;

    private String name;
    private String styleName;

    private String code;
    private String description;
    private Double price;
    private Integer durationMinutes;
    private String imageUrl;

    private String suitableFaceShapes;
    private String suitableHairTypes;

    public String getEffectiveName() {
        if (styleName != null && !styleName.trim().isEmpty()) {
            return styleName.trim();
        }
        if (name != null && !name.trim().isEmpty()) {
            return name.trim();
        }
        return null;
    }
}
