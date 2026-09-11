package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.entity.StyleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface StyleTypeRepository extends JpaRepository<StyleType, UUID> {
    List<StyleType> findBySalonIdOrderByNameAsc(UUID salonId);
    List<StyleType> findAllByOrderByNameAsc();
    Optional<StyleType> findByNameIgnoreCase(String name);
    Optional<StyleType> findByCodeIgnoreCase(String code);
    boolean existsByNameIgnoreCase(String name);
}
