package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.Salon;
import lombok.*;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalonResponse {
    private UUID id;
    private String salonName;
    private String ownerName;
    private String phoneNumber;
    private String email;
    private String salonAddress;
    private String city;
    private String pincode;
    private String salonLogo;
    private String salonDescription;
    private String locationLink;
    private String openingTime;
    private String closingTime;
    private String status;
    private List<DayScheduleDto> weeklySchedule;
    private String operatingSchedule;
    private LocalDateTime createdAt;

    public static SalonResponse fromEntity(Salon salon) {
        if (salon == null) return null;
        List<DayScheduleDto> parsedSchedule = null;
        if (salon.getOperatingSchedule() != null && !salon.getOperatingSchedule().trim().isEmpty()) {
            parsedSchedule = com.saloon.Salonmgmt.util.ScheduleJsonUtil.fromJson(salon.getOperatingSchedule());
        }

        return SalonResponse.builder()
                .id(salon.getId())
                .salonName(salon.getName())
                .ownerName(salon.getOwnerName())
                .phoneNumber(salon.getPhone())
                .email(salon.getEmail())
                .salonAddress(salon.getAddress())
                .city(salon.getCity())
                .pincode(salon.getPincode())
                .salonLogo(salon.getLogo())
                .salonDescription(salon.getDescription())
                .locationLink(salon.getLocationLink())
                .openingTime(salon.getOpeningTime())
                .closingTime(salon.getClosingTime())
                .status(salon.getStatus())
                .weeklySchedule(parsedSchedule)
                .operatingSchedule(salon.getOperatingSchedule())
                .createdAt(salon.getCreatedAt())
                .build();
    }
}
