package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.entity.Staff;
import com.saloon.Salonmgmt.entity.enums.StaffStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StaffRepository extends JpaRepository<Staff, UUID> {
    List<Staff> findBySalonIdOrderByNameAsc(UUID salonId);
    List<Staff> findBySalonIdAndStatus(UUID salonId, StaffStatus status);
    List<Staff> findAllByOrderByNameAsc();
    Optional<Staff> findBySalonIdAndPhone(UUID salonId, String phone);
    long countBySalonIdAndStatus(UUID salonId, StaffStatus status);
}
