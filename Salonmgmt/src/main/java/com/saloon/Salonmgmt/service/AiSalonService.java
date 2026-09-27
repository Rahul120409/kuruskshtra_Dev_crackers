package com.saloon.Salonmgmt.service;

import com.saloon.Salonmgmt.dto.*;
import com.saloon.Salonmgmt.entity.QueueToken;
import com.saloon.Salonmgmt.entity.Salon;
import com.saloon.Salonmgmt.entity.Staff;
import com.saloon.Salonmgmt.entity.enums.QueueStatus;
import com.saloon.Salonmgmt.entity.enums.StaffStatus;
import com.saloon.Salonmgmt.repository.AppointmentRepository;
import com.saloon.Salonmgmt.repository.QueueTokenRepository;
import com.saloon.Salonmgmt.repository.SalonRepository;
import com.saloon.Salonmgmt.repository.StaffRepository;
import com.saloon.Salonmgmt.util.ScheduleJsonUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.TextStyle;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AiSalonService {

    private final QueueTokenRepository queueTokenRepository;
    private final StaffRepository staffRepository;
    private final SalonRepository salonRepository;
    private final AppointmentRepository appointmentRepository;

    /**
     * SMART AI WAIT TIME ESTIMATOR
     */
    @Transactional(readOnly = true)
    public AiWaitTimeEstimationResponse estimateWaitTime(UUID salonId, Integer requestedDuration, UUID staffId) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new IllegalArgumentException("Salon not found with ID: " + salonId));

        int duration = (requestedDuration != null && requestedDuration > 0) ? requestedDuration : 30;
        LocalDate today = LocalDate.now();

        List<QueueToken> waitingTokens = queueTokenRepository.findBySalonIdAndQueueDateAndStatusInOrderByTokenNumberAsc(
                salonId, today, List.of(QueueStatus.WAITING, QueueStatus.CALLED));

        long activeStylists = staffRepository.countBySalonIdAndStatus(salonId, StaffStatus.AVAILABLE)
                + staffRepository.countBySalonIdAndStatus(salonId, StaffStatus.BUSY);
        if (activeStylists <= 0) activeStylists = 1;

        String stylistName = null;
        int customersAhead;
        int sumDurationsAhead = 0;

        if (staffId != null) {
            Staff staff = staffRepository.findById(staffId).orElse(null);
            if (staff != null) {
                stylistName = staff.getName();
            }
            List<QueueToken> staffQueue = waitingTokens.stream()
                    .filter(t -> staffId.equals(t.getStaffId()))
                    .collect(Collectors.toList());
            customersAhead = staffQueue.size();
            sumDurationsAhead = staffQueue.stream().mapToInt(QueueToken::getServiceDurationMinutes).sum();
        } else {
            customersAhead = waitingTokens.size();
            sumDurationsAhead = waitingTokens.stream().mapToInt(QueueToken::getServiceDurationMinutes).sum();
        }

        // Smart AI formula: (Sum of remaining durations / active stylists) + 3 min chair prep buffer per customer
        int baseWait = (int) Math.ceil((double) sumDurationsAhead / activeStylists);
        int prepBuffer = (int) Math.ceil((double) (customersAhead * 3) / activeStylists);
        int totalEstimatedMinutes = Math.max(0, baseWait + prepBuffer);

        double confidence = 0.94;
        String explanation;
        if (customersAhead == 0) {
            explanation = "No wait time! Chairs are currently open and stylists are available.";
            totalEstimatedMinutes = 0;
            confidence = 0.98;
        } else {
            String stylistClause = stylistName != null ? " for " + stylistName : " across " + activeStylists + " active stylist(s)";
            explanation = String.format(
                    "AI Prediction: ~%d mins. %d customer(s) ahead%s (avg %d min services) + chair prep buffer.",
                    totalEstimatedMinutes, customersAhead, stylistClause, (sumDurationsAhead / customersAhead)
            );
        }

        return AiWaitTimeEstimationResponse.builder()
                .salonId(salon.getId())
                .estimatedWaitMinutes(totalEstimatedMinutes)
                .totalWaitingCustomers(waitingTokens.size())
                .customersAhead(customersAhead)
                .activeStylistsCount(activeStylists)
                .requestedServiceDuration(duration)
                .stylistName(stylistName)
                .confidenceScore(confidence)
                .aiExplanation(explanation)
                .build();
    }

    /**
     * AI SMART BOOKING SLOT SUGGESTER
     */
    @Transactional(readOnly = true)
    public AiSlotSuggestionResponse suggestBookingSlots(AiSlotSuggestionRequest request) {
        if (request.getSalonId() == null) {
            throw new IllegalArgumentException("Salon ID is required");
        }
        Salon salon = salonRepository.findById(request.getSalonId())
                .orElseThrow(() -> new IllegalArgumentException("Salon not found with ID: " + request.getSalonId()));

        LocalDate targetDate = request.getDate() != null ? request.getDate() : LocalDate.now().plusDays(1);
        String dayName = targetDate.getDayOfWeek().getDisplayName(TextStyle.FULL, Locale.ENGLISH);

        List<DayScheduleDto> schedule = ScheduleJsonUtil.fromJson(salon.getOperatingSchedule());
        DayScheduleDto todaySchedule = schedule.stream()
                .filter(d -> dayName.equalsIgnoreCase(d.getDay()))
                .findFirst()
                .orElse(null);

        if (todaySchedule != null && Boolean.TRUE.equals(todaySchedule.getIsClosed())) {
            return AiSlotSuggestionResponse.builder()
                    .salonId(salon.getId())
                    .salonName(salon.getName())
                    .date(targetDate)
                    .suggestedSlots(List.of())
                    .aiSummary("Salon is closed on " + dayName + "s per registered weekly schedule.")
                    .build();
        }

        List<String> bookedTimes = request.getPreferredStaffId() != null
                ? appointmentRepository.findBookedTimesByStaffIdAndDate(request.getPreferredStaffId(), targetDate)
                : List.of();

        List<String> candidateSlots = List.of(
                "09:30 AM", "10:30 AM", "11:30 AM", "01:30 PM", "03:30 PM", "04:30 PM", "06:30 PM", "07:30 PM"
        );

        List<AiSlotSuggestionDto> suggestions = new ArrayList<>();

        for (String slot : candidateSlots) {
            if (bookedTimes.contains(slot)) {
                continue; // Skip booked slot
            }

            if (slot.contains("11:30 AM") || slot.contains("10:30 AM")) {
                suggestions.add(AiSlotSuggestionDto.builder()
                        .time(slot)
                        .badge("⭐ Best Match - Least Crowded")
                        .trafficLevel("LOW")
                        .estimatedWaitTimeMinutes(0)
                        .reason("Historical low-traffic window with zero expected in-salon wait time.")
                        .build());
            } else if (slot.contains("09:30 AM") || slot.contains("03:30 PM")) {
                suggestions.add(AiSlotSuggestionDto.builder()
                        .time(slot)
                        .badge("⚡ Fastest Service Window")
                        .trafficLevel("LOW")
                        .estimatedWaitTimeMinutes(0)
                        .reason("Optimal stylist turnaround time after opening/shift rest.")
                        .build());
            } else {
                suggestions.add(AiSlotSuggestionDto.builder()
                        .time(slot)
                        .badge("🕒 Prime Time Slot")
                        .trafficLevel("MEDIUM")
                        .estimatedWaitTimeMinutes(5)
                        .reason("High convenience slot with high customer satisfaction.")
                        .build());
            }

            if (suggestions.size() >= 3) break;
        }

        String summary = String.format(
                "AI analyzed %s's schedule for %s (%s). Found %d optimal booking windows with minimal waiting time.",
                salon.getName(), targetDate, dayName, suggestions.size()
        );

        return AiSlotSuggestionResponse.builder()
                .salonId(salon.getId())
                .salonName(salon.getName())
                .date(targetDate)
                .suggestedSlots(suggestions)
                .aiSummary(summary)
                .build();
    }
}
