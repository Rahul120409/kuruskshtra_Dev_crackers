package com.saloon.Salonmgmt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LoginRequest {
    private String email;
    private String phone;
    private String mobileNumber;
    private String emailOrPhone;
    private String password;

    public String getIdentifier() {
        if (emailOrPhone != null && !emailOrPhone.trim().isEmpty()) {
            return emailOrPhone.trim();
        }
        if (email != null && !email.trim().isEmpty()) {
            return email.trim();
        }
        if (phone != null && !phone.trim().isEmpty()) {
            return phone.trim();
        }
        if (mobileNumber != null && !mobileNumber.trim().isEmpty()) {
            return mobileNumber.trim();
        }
        return null;
    }
}
