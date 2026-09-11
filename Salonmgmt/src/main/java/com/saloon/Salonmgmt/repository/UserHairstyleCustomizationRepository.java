package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.model.UserHairstyleCustomization;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UserHairstyleCustomizationRepository extends JpaRepository<UserHairstyleCustomization, Long> {
    List<UserHairstyleCustomization> findTop8ByOrderByCreatedAtDesc();
}
