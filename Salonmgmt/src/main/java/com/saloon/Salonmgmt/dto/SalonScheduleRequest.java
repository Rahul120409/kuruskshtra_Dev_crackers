package com.saloon.Salonmgmt.dto;

import lombok.*;

import java.util.ArrayList;
import java.util.List;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalonScheduleRequest {

    @Builder.Default
    private List<DayScheduleDto> weeklySchedule = new ArrayList<>();

    public void setSchedules(List<DayScheduleDto> schedules) {
        if (this.weeklySchedule == null || this.weeklySchedule.isEmpty()) {
            this.weeklySchedule = schedules;
        }
    }

    public void setSchedule(List<DayScheduleDto> schedule) {
        if (this.weeklySchedule == null || this.weeklySchedule.isEmpty()) {
            this.weeklySchedule = schedule;
        }
    }

    public void setDays(List<DayScheduleDto> days) {
        if (this.weeklySchedule == null || this.weeklySchedule.isEmpty()) {
            this.weeklySchedule = days;
        }
    }
}
