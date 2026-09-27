package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.entity.StyleType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
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

    @Query("SELECT t FROM StyleType t WHERE UPPER(t.gender) = UPPER(:gender) OR UPPER(t.gender) = 'UNISEX' ORDER BY t.name ASC")
    List<StyleType> findByGenderOrderByNameAsc(@Param("gender") String gender);
}
