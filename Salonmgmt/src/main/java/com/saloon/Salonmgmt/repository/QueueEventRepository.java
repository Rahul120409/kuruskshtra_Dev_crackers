package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.entity.QueueEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface QueueEventRepository extends JpaRepository<QueueEvent, UUID> {
    List<QueueEvent> findBySalonIdOrderByTimestampDesc(UUID salonId);
    List<QueueEvent> findByTokenIdOrderByTimestampAsc(UUID tokenId);
}
