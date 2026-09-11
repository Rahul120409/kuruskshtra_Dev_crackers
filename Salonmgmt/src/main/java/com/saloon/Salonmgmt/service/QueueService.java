package com.saloon.Salonmgmt.service;

import com.saloon.Salonmgmt.dto.JoinQueueRequest;
import com.saloon.Salonmgmt.dto.LiveQueueBoardResponse;
import com.saloon.Salonmgmt.dto.QueueTokenResponse;
import com.saloon.Salonmgmt.entity.QueueEvent;
import com.saloon.Salonmgmt.entity.QueueToken;
import com.saloon.Salonmgmt.entity.Staff;
import com.saloon.Salonmgmt.entity.enums.BookingSource;
import com.saloon.Salonmgmt.entity.enums.QueueStatus;
import com.saloon.Salonmgmt.entity.enums.StaffStatus;
import com.saloon.Salonmgmt.repository.QueueEventRepository;
import com.saloon.Salonmgmt.repository.QueueTokenRepository;
import com.saloon.Salonmgmt.repository.SalonRepository;
import com.saloon.Salonmgmt.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class QueueService {

    private final QueueTokenRepository queueTokenRepository;
    private final QueueEventRepository queueEventRepository;
    private final SalonRepository salonRepository;
    private final StaffRepository staffRepository;

    @Transactional
    public QueueTokenResponse joinQueue(JoinQueueRequest request) {
        if (request.getSalonId() == null) {
            throw new IllegalArgumentException("Salon ID is required");
        }
        if (!salonRepository.existsById(request.getSalonId())) {
            throw new IllegalArgumentException("Salon not found with ID: " + request.getSalonId());
        }
        if (request.getCustomerName() == null || request.getCustomerName().trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required");
        }

        LocalDate today = LocalDate.now();

        // 1. Strict atomic sequential token assignment per salon per day (1, 2, 3, 4, 5, 6...)
        int maxToken = queueTokenRepository.findMaxTokenNumber(request.getSalonId(), today);
        int nextTokenNumber = maxToken + 1;

        // 2. Active Stylist Capacity (Available + Busy)
        long activeStylists = staffRepository.countBySalonIdAndStatus(request.getSalonId(), StaffStatus.AVAILABLE)
                + staffRepository.countBySalonIdAndStatus(request.getSalonId(), StaffStatus.BUSY);
        if (activeStylists <= 0) {
            activeStylists = 1; // Fallback to 1 stylist to prevent division by zero
        }

        // 3. Current waiting queue & position
        List<QueueToken> currentWaiting = queueTokenRepository
                .findBySalonIdAndQueueDateAndStatusOrderByTokenNumberAsc(request.getSalonId(), today, QueueStatus.WAITING);
        int position = currentWaiting.size() + 1;

        // 4. Calculate dynamic estimated wait
        int totalMinutesAhead = currentWaiting.stream()
                .mapToInt(QueueToken::getServiceDurationMinutes)
                .sum();
        int estimatedWait = (int) Math.ceil((double) totalMinutesAhead / activeStylists);

        // 5. Build and save token
        BookingSource source = request.getSource() != null ? request.getSource() :
                (request.getUserId() != null ? BookingSource.ONLINE : BookingSource.OFFLINE);

        String staffName = null;
        if (request.getStaffId() != null) {
            Optional<Staff> staffOpt = staffRepository.findById(request.getStaffId());
            if (staffOpt.isPresent()) {
                staffName = staffOpt.get().getName();
            }
        }

        QueueToken token = QueueToken.builder()
                .salonId(request.getSalonId())
                .queueDate(today)
                .tokenNumber(nextTokenNumber)
                .source(source)
                .userId(request.getUserId())
                .customerName(request.getCustomerName().trim())
                .customerPhone(request.getCustomerPhone())
                .serviceId(request.getServiceId())
                .serviceName(request.getServiceName() != null ? request.getServiceName() : "General Service")
                .serviceDurationMinutes(request.getServiceDurationMinutes() != null ? request.getServiceDurationMinutes() : 30)
                .staffId(request.getStaffId())
                .staffName(staffName)
                .status(QueueStatus.WAITING)
                .position(position)
                .estimatedWaitMinutes(estimatedWait)
                .joinedAt(LocalDateTime.now())
                .build();

        QueueToken savedToken = queueTokenRepository.save(token);

        // 6. Log audit event
        logEvent(savedToken.getId(), savedToken.getSalonId(), savedToken.getTokenNumber(), "JOINED");

        // 7. Find ongoing token number
        Integer ongoingTokenNumber = findCurrentServingTokenNumber(request.getSalonId(), today);
        int customersAhead = Math.max(0, position - 1);

        return QueueTokenResponse.fromEntity(savedToken, ongoingTokenNumber, customersAhead);
    }

    @Transactional(readOnly = true)
    public LiveQueueBoardResponse getLiveQueueBoard(UUID salonId) {
        LocalDate today = LocalDate.now();

        // 1. Ongoing in-service token
        Optional<QueueToken> servingOpt = queueTokenRepository
                .findFirstBySalonIdAndQueueDateAndStatusOrderByStartedAtDesc(salonId, today, QueueStatus.IN_SERVICE);

        // 2. Last called token
        Optional<QueueToken> calledOpt = queueTokenRepository
                .findFirstBySalonIdAndQueueDateAndStatusOrderByCalledAtDesc(salonId, today, QueueStatus.CALLED);

        // 3. Next available token number for any user
        int maxToken = queueTokenRepository.findMaxTokenNumber(salonId, today);
        int nextAvailableTokenNumber = maxToken + 1;

        // 4. Active queue list
        List<QueueToken> activeTokens = queueTokenRepository
                .findBySalonIdAndQueueDateAndStatusInOrderByTokenNumberAsc(
                        salonId, today, List.of(QueueStatus.IN_SERVICE, QueueStatus.CALLED, QueueStatus.WAITING));

        int waitingCount = (int) activeTokens.stream().filter(t -> t.getStatus() == QueueStatus.WAITING).count();

        long activeStylists = staffRepository.countBySalonIdAndStatus(salonId, StaffStatus.AVAILABLE)
                + staffRepository.countBySalonIdAndStatus(salonId, StaffStatus.BUSY);
        if (activeStylists <= 0) activeStylists = 1;

        Integer ongoingNum = servingOpt.map(QueueToken::getTokenNumber).orElse(null);
        String ongoingCustomer = servingOpt.map(t -> t.getCustomerName() + " (" + t.getServiceName() + ")").orElse(null);

        List<QueueTokenResponse> activeDtoList = activeTokens.stream()
                .map(t -> {
                    int ahead = t.getPosition() != null ? Math.max(0, t.getPosition() - 1) : 0;
                    return QueueTokenResponse.fromEntity(t, ongoingNum, ahead);
                })
                .collect(Collectors.toList());

        return LiveQueueBoardResponse.builder()
                .salonId(salonId)
                .queueDate(today)
                .currentServingTokenNumber(ongoingNum)
                .currentServingCustomer(ongoingCustomer)
                .lastCalledTokenNumber(calledOpt.map(QueueToken::getTokenNumber).orElse(null))
                .nextAvailableTokenNumber(nextAvailableTokenNumber)
                .totalWaiting(waitingCount)
                .activeStylistsCount((int) activeStylists)
                .activeQueue(activeDtoList)
                .build();
    }

    @Transactional(readOnly = true)
    public QueueTokenResponse getTokenById(UUID tokenId) {
        QueueToken token = queueTokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found with ID: " + tokenId));

        Integer ongoingTokenNumber = findCurrentServingTokenNumber(token.getSalonId(), token.getQueueDate());
        int customersAhead = token.getPosition() != null ? Math.max(0, token.getPosition() - 1) : 0;

        return QueueTokenResponse.fromEntity(token, ongoingTokenNumber, customersAhead);
    }

    @Transactional
    public QueueTokenResponse callToken(UUID tokenId) {
        QueueToken token = queueTokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found with ID: " + tokenId));

        token.setStatus(QueueStatus.CALLED);
        token.setCalledAt(LocalDateTime.now());
        QueueToken updated = queueTokenRepository.save(token);

        logEvent(updated.getId(), updated.getSalonId(), updated.getTokenNumber(), "CALLED");
        recalculateQueue(token.getSalonId(), token.getQueueDate());

        Integer ongoingNum = findCurrentServingTokenNumber(token.getSalonId(), token.getQueueDate());
        return QueueTokenResponse.fromEntity(updated, ongoingNum, 0);
    }

    @Transactional
    public QueueTokenResponse startService(UUID tokenId, UUID staffId) {
        QueueToken token = queueTokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found with ID: " + tokenId));

        token.setStatus(QueueStatus.IN_SERVICE);
        token.setStartedAt(LocalDateTime.now());
        if (staffId != null) {
            token.setStaffId(staffId);
            staffRepository.findById(staffId).ifPresent(s -> {
                token.setStaffName(s.getName());
                s.setStatus(StaffStatus.BUSY);
                staffRepository.save(s);
            });
        }
        QueueToken updated = queueTokenRepository.save(token);

        logEvent(updated.getId(), updated.getSalonId(), updated.getTokenNumber(), "STARTED");
        recalculateQueue(token.getSalonId(), token.getQueueDate());

        return QueueTokenResponse.fromEntity(updated, updated.getTokenNumber(), 0);
    }

    @Transactional
    public QueueTokenResponse completeService(UUID tokenId) {
        QueueToken token = queueTokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found with ID: " + tokenId));

        token.setStatus(QueueStatus.COMPLETED);
        token.setCompletedAt(LocalDateTime.now());

        if (token.getStaffId() != null) {
            staffRepository.findById(token.getStaffId()).ifPresent(s -> {
                s.setStatus(StaffStatus.AVAILABLE);
                staffRepository.save(s);
            });
        }

        QueueToken updated = queueTokenRepository.save(token);

        logEvent(updated.getId(), updated.getSalonId(), updated.getTokenNumber(), "COMPLETED");

        // Automatically recalculate remaining queue positions & wait times!
        recalculateQueue(token.getSalonId(), token.getQueueDate());

        Integer ongoingNum = findCurrentServingTokenNumber(token.getSalonId(), token.getQueueDate());
        return QueueTokenResponse.fromEntity(updated, ongoingNum, 0);
    }

    @Transactional
    public QueueTokenResponse cancelToken(UUID tokenId) {
        QueueToken token = queueTokenRepository.findById(tokenId)
                .orElseThrow(() -> new IllegalArgumentException("Token not found with ID: " + tokenId));

        token.setStatus(QueueStatus.CANCELLED);
        QueueToken updated = queueTokenRepository.save(token);

        logEvent(updated.getId(), updated.getSalonId(), updated.getTokenNumber(), "CANCELLED");
        recalculateQueue(token.getSalonId(), token.getQueueDate());

        Integer ongoingNum = findCurrentServingTokenNumber(token.getSalonId(), token.getQueueDate());
        return QueueTokenResponse.fromEntity(updated, ongoingNum, 0);
    }

    // --- Private Helper Methods ---

    private void recalculateQueue(UUID salonId, LocalDate queueDate) {
        List<QueueToken> waitingList = queueTokenRepository
                .findBySalonIdAndQueueDateAndStatusOrderByTokenNumberAsc(salonId, queueDate, QueueStatus.WAITING);

        long activeStylists = staffRepository.countBySalonIdAndStatus(salonId, StaffStatus.AVAILABLE)
                + staffRepository.countBySalonIdAndStatus(salonId, StaffStatus.BUSY);
        if (activeStylists <= 0) activeStylists = 1;

        int runningDurationAhead = 0;
        int currentPos = 1;

        for (QueueToken t : waitingList) {
            t.setPosition(currentPos++);
            int estWait = (int) Math.ceil((double) runningDurationAhead / activeStylists);
            t.setEstimatedWaitMinutes(estWait);
            runningDurationAhead += t.getServiceDurationMinutes();
        }

        queueTokenRepository.saveAll(waitingList);
    }

    private Integer findCurrentServingTokenNumber(UUID salonId, LocalDate queueDate) {
        return queueTokenRepository
                .findFirstBySalonIdAndQueueDateAndStatusOrderByStartedAtDesc(salonId, queueDate, QueueStatus.IN_SERVICE)
                .map(QueueToken::getTokenNumber)
                .orElse(null);
    }

    private void logEvent(UUID tokenId, UUID salonId, Integer tokenNumber, String eventType) {
        QueueEvent event = QueueEvent.builder()
                .tokenId(tokenId)
                .salonId(salonId)
                .tokenNumber(tokenNumber)
                .eventType(eventType)
                .timestamp(LocalDateTime.now())
                .build();
        queueEventRepository.save(event);
    }
}
