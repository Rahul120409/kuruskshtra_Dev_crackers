package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.City;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CityResponse {
    private UUID id;
    private String name;
    private String code;
    private UUID stateId;
    private String stateName;
    private String stateCode;
    private LocalDateTime createdAt;

    public static CityResponse fromEntity(City city) {
        if (city == null) return null;
        return CityResponse.builder()
                .id(city.getId())
                .name(city.getName())
                .code(city.getCode())
                .stateId(city.getState() != null ? city.getState().getId() : null)
                .stateName(city.getState() != null ? city.getState().getName() : null)
                .stateCode(city.getState() != null ? city.getState().getCode() : null)
                .createdAt(city.getCreatedAt())
                .build();
    }
}
