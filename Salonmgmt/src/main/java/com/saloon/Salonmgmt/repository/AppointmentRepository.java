package com.saloon.Salonmgmt.repository;

import com.saloon.Salonmgmt.entity.Appointment;
import com.saloon.Salonmgmt.entity.enums.AppointmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;

@Repository
public interface AppointmentRepository extends JpaRepository<Appointment, UUID> {

    @Query("SELECT a FROM Appointment a WHERE a.salonId = :salonId ORDER BY a.appointmentDate DESC, a.appointmentTime ASC")
    List<Appointment> findBySalonIdOrderByAppointmentDateDescAppointmentTimeAsc(@Param("salonId") UUID salonId);

    @Query("SELECT a FROM Appointment a WHERE a.salonId = :salonId AND a.appointmentDate = :appointmentDate ORDER BY a.appointmentTime ASC")
    List<Appointment> findBySalonIdAndAppointmentDateOrderByAppointmentTimeAsc(
            @Param("salonId") UUID salonId, @Param("appointmentDate") LocalDate appointmentDate);

    @Query("SELECT a FROM Appointment a WHERE a.salonId = :salonId AND a.status = :status ORDER BY a.appointmentDate DESC")
    List<Appointment> findBySalonIdAndStatusOrderByAppointmentDateDesc(
            @Param("salonId") UUID salonId, @Param("status") AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.salonId = :salonId AND a.appointmentDate = :appointmentDate AND a.status = :status ORDER BY a.appointmentTime ASC")
    List<Appointment> findBySalonIdAndAppointmentDateAndStatusOrderByAppointmentTimeAsc(
            @Param("salonId") UUID salonId, @Param("appointmentDate") LocalDate appointmentDate, @Param("status") AppointmentStatus status);

    @Query("SELECT a FROM Appointment a WHERE a.userId = :userId ORDER BY a.appointmentDate DESC, a.appointmentTime DESC")
    List<Appointment> findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(@Param("userId") UUID userId);

    @Query("SELECT a FROM Appointment a WHERE a.customerPhone = :customerPhone ORDER BY a.appointmentDate DESC")
    List<Appointment> findByCustomerPhoneOrderByAppointmentDateDesc(@Param("customerPhone") String customerPhone);

    @Query("SELECT COUNT(a) > 0 FROM Appointment a WHERE a.staffId = :staffId AND a.appointmentDate = :date AND a.appointmentTime = :time AND a.status != com.saloon.Salonmgmt.entity.enums.AppointmentStatus.CANCELLED")
    boolean isStaffBookedAt(
            @Param("staffId") UUID staffId,
            @Param("date") LocalDate date,
            @Param("time") String time);

    @Query("SELECT a.appointmentTime FROM Appointment a WHERE a.staffId = :staffId AND a.appointmentDate = :date AND a.status != com.saloon.Salonmgmt.entity.enums.AppointmentStatus.CANCELLED")
    List<String> findBookedTimesByStaffIdAndDate(
            @Param("staffId") UUID staffId,
            @Param("date") LocalDate date);

    long countBySalonIdAndAppointmentDate(UUID salonId, LocalDate date);
}
