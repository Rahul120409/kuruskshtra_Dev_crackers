package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.entity.SpecificStyle;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SpecificStyleRepository extends JpaRepository<SpecificStyle, UUID> {
    List<SpecificStyle> findByStyleTypeIdOrderByNameAsc(UUID styleTypeId);

    @Query("SELECT s FROM SpecificStyle s JOIN s.styleType st WHERE UPPER(st.code) = UPPER(:typeCode) ORDER BY s.name ASC")
    List<SpecificStyle> findByStyleTypeCodeOrderByNameAsc(@Param("typeCode") String typeCode);

    @Query("SELECT s FROM SpecificStyle s JOIN FETCH s.styleType ORDER BY s.name ASC")
    List<SpecificStyle> findAllWithStyleTypeOrderByNameAsc();
}
