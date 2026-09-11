package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.State;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StateResponse {
    private UUID id;
    private String name;
    private String code;
    private int cityCount;
    private LocalDateTime createdAt;

    public static StateResponse fromEntity(State state) {
        if (state == null) return null;
        return StateResponse.builder()
                .id(state.getId())
                .name(state.getName())
                .code(state.getCode())
                .cityCount(state.getCities() != null ? state.getCities().size() : 0)
                .createdAt(state.getCreatedAt())
                .build();
    }
}
