package com.saloon.Salonmgmt.service;

import com.saloon.Salonmgmt.dto.StaffRequest;
import com.saloon.Salonmgmt.dto.StaffResponse;
import com.saloon.Salonmgmt.entity.Staff;
import com.saloon.Salonmgmt.entity.enums.StaffStatus;
import com.saloon.Salonmgmt.repository.SalonRepository;
import com.saloon.Salonmgmt.repository.StaffRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StaffService {

    private final StaffRepository staffRepository;
    private final SalonRepository salonRepository;

    @Transactional
    public StaffResponse createStaff(StaffRequest request) {
        if (request.getSalonId() == null) {
            throw new IllegalArgumentException("Salon ID is required to assign staff");
        }

        if (!salonRepository.existsById(request.getSalonId())) {
            throw new IllegalArgumentException("Salon not found with ID: " + request.getSalonId());
        }

        String name = request.getName();
        if (name == null || name.trim().isEmpty()) {
            throw new IllegalArgumentException("Staff name is required");
        }

        String phone = request.getEffectivePhone();
        if (phone == null || phone.isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String specialization = request.getEffectiveSpecialization();
        if (specialization == null || specialization.isEmpty()) {
            throw new IllegalArgumentException("Specialization or Role is required (e.g., Master Barber, Hair Stylist)");
        }

        Staff staff = Staff.builder()
                .salonId(request.getSalonId())
                .userId(request.getUserId())
                .name(name.trim())
                .email(request.getEmail() != null ? request.getEmail().trim().toLowerCase() : null)
                .phone(phone)
                .specialization(specialization)
                .status(request.getStatus() != null ? request.getStatus() : StaffStatus.AVAILABLE)
                .experienceYears(request.getExperienceYears())
                .profileImage(request.getProfileImage())
                .build();

        Staff saved = staffRepository.save(staff);
        return StaffResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> getAllStaff(UUID salonId) {
        List<Staff> list;
        if (salonId != null) {
            list = staffRepository.findBySalonIdOrderByNameAsc(salonId);
        } else {
            list = staffRepository.findAllByOrderByNameAsc();
        }
        return list.stream()
                .map(StaffResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StaffResponse getStaffById(UUID id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with ID: " + id));
        return StaffResponse.fromEntity(staff);
    }

    @Transactional(readOnly = true)
    public List<StaffResponse> getStaffBySalonAndStatus(UUID salonId, StaffStatus status) {
        return staffRepository.findBySalonIdAndStatus(salonId, status)
                .stream()
                .map(StaffResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public StaffResponse updateStaffStatus(UUID id, StaffStatus status) {
        if (status == null) {
            throw new IllegalArgumentException("Status is required (AVAILABLE, BUSY, BREAK, OFFLINE)");
        }
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with ID: " + id));
        staff.setStatus(status);
        Staff updated = staffRepository.save(staff);
        return StaffResponse.fromEntity(updated);
    }

    @Transactional
    public StaffResponse updateStaff(UUID id, StaffRequest request) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with ID: " + id));

        if (request.getName() != null && !request.getName().trim().isEmpty()) {
            staff.setName(request.getName().trim());
        }
        if (request.getEmail() != null) {
            staff.setEmail(request.getEmail().trim().toLowerCase());
        }
        if (request.getEffectivePhone() != null && !request.getEffectivePhone().isEmpty()) {
            staff.setPhone(request.getEffectivePhone());
        }
        if (request.getEffectiveSpecialization() != null && !request.getEffectiveSpecialization().isEmpty()) {
            staff.setSpecialization(request.getEffectiveSpecialization());
        }
        if (request.getStatus() != null) {
            staff.setStatus(request.getStatus());
        }
        if (request.getExperienceYears() != null) {
            staff.setExperienceYears(request.getExperienceYears());
        }
        if (request.getProfileImage() != null) {
            staff.setProfileImage(request.getProfileImage());
        }

        Staff updated = staffRepository.save(staff);
        return StaffResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteStaff(UUID id) {
        Staff staff = staffRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Staff member not found with ID: " + id));
        staffRepository.delete(staff);
    }
}
