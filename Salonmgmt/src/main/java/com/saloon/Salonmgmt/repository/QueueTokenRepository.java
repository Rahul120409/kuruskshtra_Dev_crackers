package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.entity.QueueToken;
import com.saloon.Salonmgmt.entity.enums.QueueStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface QueueTokenRepository extends JpaRepository<QueueToken, UUID> {

    @Query("SELECT COALESCE(MAX(q.tokenNumber), 0) FROM QueueToken q WHERE q.salonId = :salonId AND q.queueDate = :queueDate")
    Integer findMaxTokenNumber(@Param("salonId") UUID salonId, @Param("queueDate") LocalDate queueDate);

    Optional<QueueToken> findBySalonIdAndQueueDateAndTokenNumber(UUID salonId, LocalDate queueDate, Integer tokenNumber);

    List<QueueToken> findBySalonIdAndQueueDateAndStatusInOrderByTokenNumberAsc(
            UUID salonId, LocalDate queueDate, List<QueueStatus> statuses);

    List<QueueToken> findBySalonIdAndQueueDateAndStatusOrderByTokenNumberAsc(
            UUID salonId, LocalDate queueDate, QueueStatus status);

    Optional<QueueToken> findFirstBySalonIdAndQueueDateAndStatusOrderByStartedAtDesc(
            UUID salonId, LocalDate queueDate, QueueStatus status);

    Optional<QueueToken> findFirstBySalonIdAndQueueDateAndStatusOrderByCalledAtDesc(
            UUID salonId, LocalDate queueDate, QueueStatus status);

    List<QueueToken> findByUserIdOrderByJoinedAtDesc(UUID userId);
}
