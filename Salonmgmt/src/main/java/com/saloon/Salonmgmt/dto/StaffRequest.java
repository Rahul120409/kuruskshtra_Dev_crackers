package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.enums.StaffStatus;
import lombok.*;

import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffRequest {
    private UUID salonId;
    private UUID userId;

    private String name;
    private String email;

    private String phone;
    private String phoneNumber;
    private String mobileNumber;

    private String specialization;
    private String role;

    private StaffStatus status;
    private Integer experienceYears;
    private String profileImage;

    public String getEffectivePhone() {
        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            return phoneNumber.trim();
        }
        if (mobileNumber != null && !mobileNumber.trim().isEmpty()) {
            return mobileNumber.trim();
        }
        if (phone != null && !phone.trim().isEmpty()) {
            return phone.trim();
        }
        return null;
    }

    public String getEffectiveSpecialization() {
        if (role != null && !role.trim().isEmpty()) {
            return role.trim();
        }
        if (specialization != null && !specialization.trim().isEmpty()) {
            return specialization.trim();
        }
        return null;
    }
}
