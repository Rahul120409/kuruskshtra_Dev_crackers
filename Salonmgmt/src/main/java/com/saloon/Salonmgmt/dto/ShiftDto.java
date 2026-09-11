package com.saloon.Salonmgmt.dto;

import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ShiftDto {

    private String fromTime; // e.g. "09:00 AM", "04:00 PM"
    private String toTime;   // e.g. "12:00 PM", "10:00 PM"

    public void setStartTime(String t) {
        if (this.fromTime == null || this.fromTime.isEmpty()) this.fromTime = t;
    }

    public void setOpenTime(String t) {
        if (this.fromTime == null || this.fromTime.isEmpty()) this.fromTime = t;
    }

    public void setFrom(String t) {
        if (this.fromTime == null || this.fromTime.isEmpty()) this.fromTime = t;
    }

    public void setEndTime(String t) {
        if (this.toTime == null || this.toTime.isEmpty()) this.toTime = t;
    }

    public void setCloseTime(String t) {
        if (this.toTime == null || this.toTime.isEmpty()) this.toTime = t;
    }

    public void setTo(String t) {
        if (this.toTime == null || this.toTime.isEmpty()) this.toTime = t;
    }
}
