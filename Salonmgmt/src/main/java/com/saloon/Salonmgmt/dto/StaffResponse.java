package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.Staff;
import com.saloon.Salonmgmt.entity.enums.StaffStatus;
import lombok.*;

import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffResponse {
    private UUID id;
    private UUID salonId;
    private UUID userId;
    private String name;
    private String email;
    private String phone;
    private String specialization;
    private StaffStatus status;
    private Integer experienceYears;
    private String profileImage;
    private LocalDateTime createdAt;

    public static StaffResponse fromEntity(Staff staff) {
        if (staff == null) return null;
        return StaffResponse.builder()
                .id(staff.getId())
                .salonId(staff.getSalonId())
                .userId(staff.getUserId())
                .name(staff.getName())
                .email(staff.getEmail())
                .phone(staff.getPhone())
                .specialization(staff.getSpecialization())
                .status(staff.getStatus())
                .experienceYears(staff.getExperienceYears())
                .profileImage(staff.getProfileImage())
                .createdAt(staff.getCreatedAt())
                .build();
    }
}
