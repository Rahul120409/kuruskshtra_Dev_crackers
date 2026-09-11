package com.saloon.Salonmgmt.dto;

import lombok.*;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class LiveQueueBoardResponse {
    private UUID salonId;
    private LocalDate queueDate;

    // Ongoing currently serving token number
    private Integer currentServingTokenNumber;
    private String currentServingCustomer;

    // Called token awaiting chair
    private Integer lastCalledTokenNumber;

    // The next number available to be assigned to ANY user (Online or Walk-in)
    private Integer nextAvailableTokenNumber;

    private int totalWaiting;
    private int activeStylistsCount;

    private List<QueueTokenResponse> activeQueue;
}
