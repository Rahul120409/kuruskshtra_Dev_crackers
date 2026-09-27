package com.saloon.Salonmgmt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalonRequest {
    private String name;
    private String salonName;

    private String ownerName;

    private String phone;
    private String phoneNumber;

    private String email;

    private String address;
    private String salonAddress;

    private String city;

    private String pincode;

    private String logo;
    private String salonLogo;

    private String description;
    private String salonDescription;

    private String locationLink;
    private String mapLink;
    private String googleMapsUrl;

    private String openingTime;
    private String closingTime;
    private String status;

    private Object operatingSchedule;
    private java.util.List<DayScheduleDto> weeklySchedule;

    public String getEffectiveName() {
        if (salonName != null && !salonName.trim().isEmpty()) {
            return salonName.trim();
        }
        if (name != null && !name.trim().isEmpty()) {
            return name.trim();
        }
        return null;
    }

    public String getEffectivePhone() {
        if (phoneNumber != null && !phoneNumber.trim().isEmpty()) {
            return phoneNumber.trim();
        }
        if (phone != null && !phone.trim().isEmpty()) {
            return phone.trim();
        }
        return null;
    }

    public String getEffectiveAddress() {
        if (salonAddress != null && !salonAddress.trim().isEmpty()) {
            return salonAddress.trim();
        }
        if (address != null && !address.trim().isEmpty()) {
            return address.trim();
        }
        return null;
    }

    public String getEffectiveLogo() {
        if (salonLogo != null && !salonLogo.trim().isEmpty()) {
            return salonLogo.trim();
        }
        if (logo != null && !logo.trim().isEmpty()) {
            return logo.trim();
        }
        return null;
    }

    public String getEffectiveDescription() {
        if (salonDescription != null && !salonDescription.trim().isEmpty()) {
            return salonDescription.trim();
        }
        if (description != null && !description.trim().isEmpty()) {
            return description.trim();
        }
        return null;
    }

    public String getEffectiveLocationLink() {
        if (locationLink != null && !locationLink.trim().isEmpty()) {
            return locationLink.trim();
        }
        if (googleMapsUrl != null && !googleMapsUrl.trim().isEmpty()) {
            return googleMapsUrl.trim();
        }
        if (mapLink != null && !mapLink.trim().isEmpty()) {
            return mapLink.trim();
        }
        return null;
    }
}
