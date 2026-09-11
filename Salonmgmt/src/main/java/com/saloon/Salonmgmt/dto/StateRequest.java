package com.saloon.Salonmgmt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StateRequest {
    private String name;
    private String stateName;
    private String code;
    private String stateCode;

    public String getEffectiveName() {
        if (stateName != null && !stateName.trim().isEmpty()) {
            return stateName.trim();
        }
        if (name != null && !name.trim().isEmpty()) {
            return name.trim();
        }
        return null;
    }

    public String getEffectiveCode() {
        if (stateCode != null && !stateCode.trim().isEmpty()) {
            return stateCode.trim().toUpperCase();
        }
        if (code != null && !code.trim().isEmpty()) {
            return code.trim().toUpperCase();
        }
        return null;
    }
}
