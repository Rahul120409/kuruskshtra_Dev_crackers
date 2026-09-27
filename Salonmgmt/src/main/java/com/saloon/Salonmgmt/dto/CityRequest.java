package com.saloon.Salonmgmt.dto;

import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CityRequest {
    private String name;
    private String cityName;
    private String code;
    private String cityCode;
    private UUID stateId;
    private String stateCode;

    public String getEffectiveName() {
        if (cityName != null && !cityName.trim().isEmpty()) {
            return cityName.trim();
        }
        if (name != null && !name.trim().isEmpty()) {
            return name.trim();
        }
        return null;
    }

    public String getEffectiveCode() {
        if (cityCode != null && !cityCode.trim().isEmpty()) {
            return cityCode.trim().toUpperCase();
        }
        if (code != null && !code.trim().isEmpty()) {
            return code.trim().toUpperCase();
        }
        return null;
    }
}
