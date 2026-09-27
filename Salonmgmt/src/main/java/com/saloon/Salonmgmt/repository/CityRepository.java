package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.entity.City;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CityRepository extends JpaRepository<City, UUID> {
    List<City> findByStateIdOrderByNameAsc(UUID stateId);

    @Query("SELECT c FROM City c JOIN c.state s WHERE UPPER(s.code) = UPPER(:stateCode) ORDER BY c.name ASC")
    List<City> findByStateCodeOrderByNameAsc(@Param("stateCode") String stateCode);

    boolean existsByStateIdAndCodeIgnoreCase(UUID stateId, String code);
    boolean existsByStateIdAndNameIgnoreCase(UUID stateId, String name);

    @Query("SELECT c FROM City c JOIN FETCH c.state ORDER BY c.name ASC")
    List<City> findAllWithStateOrderByNameAsc();
}
