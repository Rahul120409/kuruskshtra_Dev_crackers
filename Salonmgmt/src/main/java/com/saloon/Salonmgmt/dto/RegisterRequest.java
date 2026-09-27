package com.saloon.Salonmgmt.dto;

import com.fasterxml.jackson.annotation.JsonFormat;
import com.saloon.Salonmgmt.entity.enums.Gender;
import com.saloon.Salonmgmt.entity.enums.Role;
import lombok.*;

import java.time.LocalDate;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RegisterRequest {
    private String name;
    private String email;
    private String password;
    private String confirmPassword;
    private String phone;
    private String mobileNumber;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "yyyy-MM-dd")
    private LocalDate dob;

    private Gender gender;
    private Role role;

    public String getEffectivePhone() {
        if (phone != null && !phone.trim().isEmpty()) {
            return phone.trim();
        }
        if (mobileNumber != null && !mobileNumber.trim().isEmpty()) {
            return mobileNumber.trim();
        }
        return null;
    }
}
