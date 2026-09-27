package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.enums.StaffStatus;
import lombok.*;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StaffStatusRequest {
    private StaffStatus status;
}
