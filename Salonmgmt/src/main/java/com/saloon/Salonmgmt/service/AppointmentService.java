package com.saloon.Salonmgmt.service;

import com.saloon.Salonmgmt.dto.*;
import com.saloon.Salonmgmt.entity.Appointment;
import com.saloon.Salonmgmt.entity.Salon;
import com.saloon.Salonmgmt.entity.Staff;
import com.saloon.Salonmgmt.entity.User;
import com.saloon.Salonmgmt.entity.enums.AppointmentStatus;
import com.saloon.Salonmgmt.entity.enums.BookingSource;
import com.saloon.Salonmgmt.repository.AppointmentRepository;
import com.saloon.Salonmgmt.repository.SalonRepository;
import com.saloon.Salonmgmt.repository.StaffRepository;
import com.saloon.Salonmgmt.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AppointmentService {

    private final AppointmentRepository appointmentRepository;
    private final SalonRepository salonRepository;
    private final UserRepository userRepository;
    private final StaffRepository staffRepository;
    private final QueueService queueService;

    @Transactional
    public AppointmentResponse createAppointment(AppointmentRequest request) {
        if (request.getSalonId() == null) {
            throw new IllegalArgumentException("Salon ID is required");
        }
        Salon salon = salonRepository.findById(request.getSalonId())
                .orElseThrow(() -> new IllegalArgumentException("Salon not found with ID: " + request.getSalonId()));

        UUID userId = request.getEffectiveUserId();
        String customerName = request.getCustomerName();
        String customerPhone = request.getCustomerPhone();
        String customerEmail = request.getCustomerEmail();

        if (userId != null) {
            User user = userRepository.findById(userId).orElse(null);
            if (user != null) {
                if (customerName == null || customerName.trim().isEmpty()) {
                    customerName = user.getName();
                }
                if (customerPhone == null || customerPhone.trim().isEmpty()) {
                    customerPhone = user.getPhone();
                }
                if (customerEmail == null || customerEmail.trim().isEmpty()) {
                    customerEmail = user.getEmail();
                }
            }
        }

        if (customerName == null || customerName.trim().isEmpty()) {
            throw new IllegalArgumentException("Customer name is required");
        }
        if (request.getAppointmentDate() == null) {
            throw new IllegalArgumentException("Appointment date is required");
        }
        if (request.getAppointmentDate().isBefore(LocalDate.now())) {
            throw new IllegalArgumentException("Cannot book an appointment for a past date");
        }
        if (request.getAppointmentTime() == null || request.getAppointmentTime().trim().isEmpty()) {
            throw new IllegalArgumentException("Appointment time is required");
        }

        String staffName = request.getStaffName();
        if (request.getStaffId() != null) {
            Staff staff = staffRepository.findById(request.getStaffId()).orElse(null);
            if (staff != null) {
                staffName = staff.getName();
            }

            // Conflict detection: prevent double-booking the same stylist at the same time
            if (appointmentRepository.isStaffBookedAt(request.getStaffId(), request.getAppointmentDate(), request.getAppointmentTime().trim())) {
                String nameDisplay = staffName != null ? staffName : "Selected stylist";
                throw new IllegalArgumentException(nameDisplay + " is already booked for " + request.getAppointmentDate() + " at " + request.getAppointmentTime() + ". Please choose another time slot or stylist.");
            }
        }

        Appointment appointment = Appointment.builder()
                .salonId(salon.getId())
                .salonName(salon.getName())
                .userId(userId)
                .customerName(customerName.trim())
                .customerPhone(customerPhone != null ? customerPhone.trim() : null)
                .customerEmail(customerEmail != null ? customerEmail.trim().toLowerCase() : null)
                .serviceId(request.getServiceId())
                .serviceName(request.getServiceName() != null ? request.getServiceName().trim() : "Salon Service")
                .servicePrice(request.getServicePrice())
                .serviceDurationMinutes(request.getServiceDurationMinutes() != null ? request.getServiceDurationMinutes() : 30)
                .staffId(request.getStaffId())
                .staffName(staffName)
                .appointmentDate(request.getAppointmentDate())
                .appointmentTime(request.getAppointmentTime().trim())
                .status(AppointmentStatus.CONFIRMED)
                .bookingSource(request.getBookingSource() != null ? request.getBookingSource() : BookingSource.ONLINE)
                .notes(request.getNotes())
                .build();

        Appointment saved = appointmentRepository.save(appointment);
        return AppointmentResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsBySalon(UUID salonId, LocalDate date, AppointmentStatus status) {
        if (!salonRepository.existsById(salonId)) {
            throw new IllegalArgumentException("Salon not found with ID: " + salonId);
        }

        List<Appointment> appointments;
        if (date != null && status != null) {
            appointments = appointmentRepository.findBySalonIdAndAppointmentDateAndStatusOrderByAppointmentTimeAsc(salonId, date, status);
        } else if (date != null) {
            appointments = appointmentRepository.findBySalonIdAndAppointmentDateOrderByAppointmentTimeAsc(salonId, date);
        } else if (status != null) {
            appointments = appointmentRepository.findBySalonIdAndStatusOrderByAppointmentDateDesc(salonId, status);
        } else {
            appointments = appointmentRepository.findBySalonIdOrderByAppointmentDateDescAppointmentTimeAsc(salonId);
        }

        return appointments.stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByUser(UUID userId) {
        return appointmentRepository.findByUserIdOrderByAppointmentDateDescAppointmentTimeDesc(userId)
                .stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<AppointmentResponse> getAppointmentsByPhone(String phone) {
        return appointmentRepository.findByCustomerPhoneOrderByAppointmentDateDesc(phone)
                .stream()
                .map(AppointmentResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public AppointmentResponse getAppointmentById(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));
        return AppointmentResponse.fromEntity(appointment);
    }

    @Transactional
    public AppointmentResponse updateAppointmentStatus(UUID id, AppointmentStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Status cannot be null");
        }
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));

        appointment.setStatus(status);
        Appointment saved = appointmentRepository.save(appointment);
        return AppointmentResponse.fromEntity(saved);
    }

    @Transactional
    public AppointmentCheckInResponse checkInAppointment(UUID id) {
        Appointment appointment = appointmentRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Appointment not found with ID: " + id));

        if (appointment.getStatus() == AppointmentStatus.CANCELLED) {
            throw new IllegalArgumentException("Cannot check in a cancelled appointment");
        }
        if (appointment.getStatus() == AppointmentStatus.COMPLETED) {
            throw new IllegalArgumentException("Appointment has already been completed");
        }

        // Generate a live sequential token in queue
        JoinQueueRequest joinRequest = JoinQueueRequest.builder()
                .salonId(appointment.getSalonId())
                .userId(appointment.getUserId())
                .customerName(appointment.getCustomerName())
                .customerPhone(appointment.getCustomerPhone())
                .serviceId(appointment.getServiceId())
                .serviceName(appointment.getServiceName())
                .serviceDurationMinutes(appointment.getServiceDurationMinutes())
                .staffId(appointment.getStaffId())
                .source(appointment.getBookingSource() != null ? appointment.getBookingSource() : BookingSource.ONLINE)
                .build();

        QueueTokenResponse tokenResponse = queueService.joinQueue(joinRequest);

        appointment.setStatus(AppointmentStatus.CHECKED_IN);
        appointment.setQueueTokenId(tokenResponse.getId());
        appointment.setQueueTokenNumber(tokenResponse.getTokenNumber());
        Appointment saved = appointmentRepository.save(appointment);

        return AppointmentCheckInResponse.builder()
                .appointment(AppointmentResponse.fromEntity(saved))
                .queueToken(tokenResponse)
                .build();
    }

    @Transactional(readOnly = true)
    public List<AvailableSlotDto> getAvailableSlots(UUID salonId, UUID staffId, LocalDate date) {
        if (!salonRepository.existsById(salonId)) {
            throw new IllegalArgumentException("Salon not found with ID: " + salonId);
        }
        if (date == null) {
            date = LocalDate.now();
        }

        List<String> defaultSlots = List.of(
                "09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM",
                "12:00 PM", "12:30 PM", "02:00 PM", "02:30 PM", "03:00 PM", "03:30 PM",
                "04:00 PM", "04:30 PM", "05:00 PM", "05:30 PM", "06:00 PM", "06:30 PM",
                "07:00 PM", "07:30 PM", "08:00 PM", "08:30 PM"
        );

        List<String> bookedTimes = staffId != null
                ? appointmentRepository.findBookedTimesByStaffIdAndDate(staffId, date)
                : List.of();

        return defaultSlots.stream().map(time -> {
            boolean isBooked = bookedTimes.contains(time);
            return AvailableSlotDto.builder()
                    .time(time)
                    .available(!isBooked)
                    .reason(isBooked ? "Stylist already booked at this time" : "Available")
                    .build();
        }).collect(Collectors.toList());
    }
}
