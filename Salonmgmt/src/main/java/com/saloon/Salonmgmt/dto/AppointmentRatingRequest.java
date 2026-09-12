package com.saloon.Salonmgmt.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AppointmentRatingRequest {
    private UUID userId;
    private Integer rating;
    private String feedback;
    private String message;

    public String getEffectiveMessage() {
        if (message != null && !message.trim().isEmpty()) {
            return message.trim();
        }
        if (feedback != null && !feedback.trim().isEmpty()) {
            return feedback.trim();
        }
        return null;
    }
}
