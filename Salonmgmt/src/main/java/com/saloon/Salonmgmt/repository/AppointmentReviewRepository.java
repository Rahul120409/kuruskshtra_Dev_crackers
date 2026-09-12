package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.entity.AppointmentReview;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface AppointmentReviewRepository extends JpaRepository<AppointmentReview, UUID> {
    Optional<AppointmentReview> findByAppointmentId(UUID appointmentId);
    List<AppointmentReview> findBySalonIdOrderByCreatedAtDesc(UUID salonId);
    List<AppointmentReview> findByUserIdOrderByCreatedAtDesc(UUID userId);
}
