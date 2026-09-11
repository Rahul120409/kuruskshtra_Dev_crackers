package com.saloon.Salonmgmt.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DayScheduleDto {

    private String day; // e.g. "Monday", "Tuesday", etc.

    @Builder.Default
    private Boolean isClosed = false;

    @Builder.Default
    private List<ShiftDto> shifts = new ArrayList<>();

    public void setDayOfWeek(String dayOfWeek) {
        if (this.day == null || this.day.isEmpty()) this.day = dayOfWeek;
    }

    public void setName(String name) {
        if (this.day == null || this.day.isEmpty()) this.day = name;
    }

    public void setClosed(Boolean closed) {
        this.isClosed = closed;
    }

    public void setTimeSlots(List<ShiftDto> slots) {
        if (this.shifts == null || this.shifts.isEmpty()) this.shifts = slots;
    }

    public void setSlots(List<ShiftDto> slots) {
        if (this.shifts == null || this.shifts.isEmpty()) this.shifts = slots;
    }
}
