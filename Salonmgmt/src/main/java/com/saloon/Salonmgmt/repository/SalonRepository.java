package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.entity.Salon;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SalonRepository extends JpaRepository<Salon, UUID> {
    Optional<Salon> findByEmail(String email);
    Optional<Salon> findByPhone(String phone);
    List<Salon> findByCityIgnoreCase(String city);
    List<Salon> findAllByOrderByCreatedAtDesc();
}
