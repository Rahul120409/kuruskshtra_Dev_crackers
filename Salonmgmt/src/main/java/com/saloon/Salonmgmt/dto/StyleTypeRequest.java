package com.saloon.Salonmgmt.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StyleTypeRequest {
    private UUID salonId;
    private String name;
    private String typeName;
    private String styleTypeName;
    private String code;
    private String description;
    private String imageUrl;
    private String gender;
    private Boolean isActive;

    public String getEffectiveName() {
        if (styleTypeName != null && !styleTypeName.trim().isEmpty()) {
            return styleTypeName.trim();
        }
        if (typeName != null && !typeName.trim().isEmpty()) {
            return typeName.trim();
        }
        if (name != null && !name.trim().isEmpty()) {
            return name.trim();
        }
        return null;
    }
}
