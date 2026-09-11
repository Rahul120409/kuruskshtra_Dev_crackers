package com.saloon.Salonmgmt.dto;

import com.saloon.Salonmgmt.entity.QueueToken;
import com.saloon.Salonmgmt.entity.enums.BookingSource;
import com.saloon.Salonmgmt.entity.enums.QueueStatus;
import lombok.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QueueTokenResponse {
    private UUID id;
    private UUID salonId;
    private LocalDate queueDate;
    private Integer tokenNumber;
    private BookingSource source;
    private UUID userId;
    private String customerName;
    private String customerPhone;
    private UUID serviceId;
    private String serviceName;
    private Integer serviceDurationMinutes;
    private UUID staffId;
    private String staffName;
    private QueueStatus status;
    private Integer position;
    private Integer estimatedWaitMinutes;

    private Integer currentServingTokenNumber;
    private Integer customersAhead;

    private LocalDateTime joinedAt;
    private LocalDateTime calledAt;
    private LocalDateTime startedAt;
    private LocalDateTime completedAt;

    public static QueueTokenResponse fromEntity(QueueToken token, Integer currentServingTokenNumber, Integer customersAhead) {
        if (token == null) return null;
        return QueueTokenResponse.builder()
                .id(token.getId())
                .salonId(token.getSalonId())
                .queueDate(token.getQueueDate())
                .tokenNumber(token.getTokenNumber())
                .source(token.getSource())
                .userId(token.getUserId())
                .customerName(token.getCustomerName())
                .customerPhone(token.getCustomerPhone())
                .serviceId(token.getServiceId())
                .serviceName(token.getServiceName())
                .serviceDurationMinutes(token.getServiceDurationMinutes())
                .staffId(token.getStaffId())
                .staffName(token.getStaffName())
                .status(token.getStatus())
                .position(token.getPosition())
                .estimatedWaitMinutes(token.getEstimatedWaitMinutes())
                .currentServingTokenNumber(currentServingTokenNumber)
                .customersAhead(customersAhead)
                .joinedAt(token.getJoinedAt())
                .calledAt(token.getCalledAt())
                .startedAt(token.getStartedAt())
                .completedAt(token.getCompletedAt())
                .build();
    }
}
