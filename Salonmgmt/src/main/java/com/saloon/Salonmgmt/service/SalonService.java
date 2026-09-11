package com.saloon.Salonmgmt.service;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.saloon.Salonmgmt.dto.DayScheduleDto;
import com.saloon.Salonmgmt.dto.SalonRequest;
import com.saloon.Salonmgmt.dto.SalonResponse;
import com.saloon.Salonmgmt.dto.SalonScheduleResponse;
import com.saloon.Salonmgmt.entity.Salon;
import com.saloon.Salonmgmt.repository.SalonRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class SalonService {

    private final SalonRepository salonRepository;
    private final ObjectMapper objectMapper = new ObjectMapper();

    @Transactional
    public SalonResponse createSalon(SalonRequest request) {
        String name = request.getEffectiveName();
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("Salon name is required");
        }

        String ownerName = request.getOwnerName();
        if (ownerName == null || ownerName.trim().isEmpty()) {
            throw new IllegalArgumentException("Owner/Manager name is required");
        }

        String phone = request.getEffectivePhone();
        if (phone == null || phone.isEmpty()) {
            throw new IllegalArgumentException("Phone number is required");
        }

        String email = request.getEmail();
        if (email == null || email.trim().isEmpty()) {
            throw new IllegalArgumentException("Email is required");
        }

        String address = request.getEffectiveAddress();
        if (address == null || address.isEmpty()) {
            throw new IllegalArgumentException("Salon address is required");
        }

        String city = request.getCity();
        if (city == null || city.trim().isEmpty()) {
            throw new IllegalArgumentException("City is required");
        }

        String pincode = request.getPincode();
        if (pincode == null || pincode.trim().isEmpty()) {
            throw new IllegalArgumentException("Pincode is required");
        }

        Salon salon = Salon.builder()
                .name(name)
                .ownerName(ownerName.trim())
                .phone(phone)
                .email(email.trim().toLowerCase())
                .address(address)
                .city(city.trim())
                .pincode(pincode.trim())
                .logo(request.getEffectiveLogo())
                .description(request.getEffectiveDescription())
                .locationLink(request.getEffectiveLocationLink())
                .openingTime(request.getOpeningTime() != null ? request.getOpeningTime().trim() : "09:00")
                .closingTime(request.getClosingTime() != null ? request.getClosingTime().trim() : "21:00")
                .status(request.getStatus() != null ? request.getStatus().trim() : "ACTIVE")
                .build();

        if (request.getWeeklySchedule() != null && !request.getWeeklySchedule().isEmpty()) {
            try {
                salon.setOperatingSchedule(objectMapper.writeValueAsString(request.getWeeklySchedule()));
            } catch (Exception ignored) {}
        } else if (request.getOperatingSchedule() != null) {
            try {
                if (request.getOperatingSchedule() instanceof String str) {
                    salon.setOperatingSchedule(str);
                } else {
                    salon.setOperatingSchedule(objectMapper.writeValueAsString(request.getOperatingSchedule()));
                }
            } catch (Exception ignored) {}
        }

        Salon saved = salonRepository.save(salon);
        return SalonResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<SalonResponse> getAllSalons() {
        return salonRepository.findAllByOrderByCreatedAtDesc()
                .stream()
                .map(SalonResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SalonResponse getSalonById(UUID id) {
        Salon salon = salonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Salon not found with ID: " + id));
        return SalonResponse.fromEntity(salon);
    }

    @Transactional(readOnly = true)
    public List<SalonResponse> getSalonsByCity(String city) {
        return salonRepository.findByCityIgnoreCase(city)
                .stream()
                .map(SalonResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional
    public SalonResponse updateSalon(UUID id, SalonRequest request) {
        Salon salon = salonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Salon not found with ID: " + id));

        if (request.getEffectiveName() != null && !request.getEffectiveName().isEmpty()) {
            salon.setName(request.getEffectiveName());
        }
        if (request.getOwnerName() != null && !request.getOwnerName().trim().isEmpty()) {
            salon.setOwnerName(request.getOwnerName().trim());
        }
        if (request.getEffectivePhone() != null && !request.getEffectivePhone().isEmpty()) {
            salon.setPhone(request.getEffectivePhone());
        }
        if (request.getEmail() != null && !request.getEmail().trim().isEmpty()) {
            salon.setEmail(request.getEmail().trim().toLowerCase());
        }
        if (request.getEffectiveAddress() != null && !request.getEffectiveAddress().isEmpty()) {
            salon.setAddress(request.getEffectiveAddress());
        }
        if (request.getCity() != null && !request.getCity().trim().isEmpty()) {
            salon.setCity(request.getCity().trim());
        }
        if (request.getPincode() != null && !request.getPincode().trim().isEmpty()) {
            salon.setPincode(request.getPincode().trim());
        }
        if (request.getEffectiveLogo() != null) {
            salon.setLogo(request.getEffectiveLogo());
        }
        if (request.getEffectiveDescription() != null) {
            salon.setDescription(request.getEffectiveDescription());
        }
        if (request.getEffectiveLocationLink() != null) {
            salon.setLocationLink(request.getEffectiveLocationLink());
        }
        if (request.getOpeningTime() != null) {
            salon.setOpeningTime(request.getOpeningTime().trim());
        }
        if (request.getClosingTime() != null) {
            salon.setClosingTime(request.getClosingTime().trim());
        }
        if (request.getStatus() != null) {
            salon.setStatus(request.getStatus().trim());
        }

        if (request.getWeeklySchedule() != null && !request.getWeeklySchedule().isEmpty()) {
            try {
                salon.setOperatingSchedule(objectMapper.writeValueAsString(request.getWeeklySchedule()));
            } catch (Exception ignored) {}
        } else if (request.getOperatingSchedule() != null) {
            try {
                if (request.getOperatingSchedule() instanceof String str) {
                    salon.setOperatingSchedule(str);
                } else {
                    salon.setOperatingSchedule(objectMapper.writeValueAsString(request.getOperatingSchedule()));
                }
            } catch (Exception ignored) {}
        }

        Salon updated = salonRepository.save(salon);
        return SalonResponse.fromEntity(updated);
    }

    @Transactional(readOnly = true)
    public SalonScheduleResponse getSchedule(UUID salonId) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new IllegalArgumentException("Salon not found with ID: " + salonId));

        List<DayScheduleDto> weeklyList = new ArrayList<>();
        if (salon.getOperatingSchedule() != null && !salon.getOperatingSchedule().trim().isEmpty()) {
            try {
                JsonNode root = objectMapper.readTree(salon.getOperatingSchedule());
                weeklyList = extractDaySchedules(root);
            } catch (Exception ignored) {}
        }

        return SalonScheduleResponse.builder()
                .salonId(salon.getId())
                .salonName(salon.getName())
                .weeklySchedule(weeklyList)
                .status(salon.getStatus())
                .updatedAt(salon.getUpdatedAt())
                .build();
    }

    @Transactional
    public SalonScheduleResponse updateSchedule(UUID salonId, Object schedulePayload) {
        Salon salon = salonRepository.findById(salonId)
                .orElseThrow(() -> new IllegalArgumentException("Salon not found with ID: " + salonId));

        if (schedulePayload == null) {
            throw new IllegalArgumentException("Schedule payload cannot be null");
        }

        try {
            List<DayScheduleDto> weeklyList;
            if (schedulePayload instanceof String str) {
                JsonNode root = objectMapper.readTree(str);
                weeklyList = extractDaySchedules(root);
            } else {
                JsonNode root = objectMapper.valueToTree(schedulePayload);
                weeklyList = extractDaySchedules(root);
            }

            String jsonString = objectMapper.writeValueAsString(weeklyList);
            salon.setOperatingSchedule(jsonString);
            Salon saved = salonRepository.save(salon);

            return SalonScheduleResponse.builder()
                    .salonId(saved.getId())
                    .salonName(saved.getName())
                    .weeklySchedule(weeklyList)
                    .status(saved.getStatus())
                    .updatedAt(saved.getUpdatedAt())
                    .build();
        } catch (Exception e) {
            throw new IllegalArgumentException("Invalid schedule JSON format: " + e.getMessage(), e);
        }
    }

    private List<DayScheduleDto> extractDaySchedules(JsonNode root) {
        if (root == null || root.isNull()) {
            return new ArrayList<>();
        }
        if (root.isArray()) {
            return objectMapper.convertValue(root, new TypeReference<List<DayScheduleDto>>() {});
        }
        if (root.isObject()) {
            if (root.has("weeklySchedule") && root.get("weeklySchedule").isArray()) {
                return objectMapper.convertValue(root.get("weeklySchedule"), new TypeReference<List<DayScheduleDto>>() {});
            }
            if (root.has("schedules") && root.get("schedules").isArray()) {
                return objectMapper.convertValue(root.get("schedules"), new TypeReference<List<DayScheduleDto>>() {});
            }
            if (root.has("schedule") && root.get("schedule").isArray()) {
                return objectMapper.convertValue(root.get("schedule"), new TypeReference<List<DayScheduleDto>>() {});
            }
            if (root.has("days") && root.get("days").isArray()) {
                return objectMapper.convertValue(root.get("days"), new TypeReference<List<DayScheduleDto>>() {});
            }
            if (root.has("day") || root.has("dayOfWeek")) {
                DayScheduleDto single = objectMapper.convertValue(root, DayScheduleDto.class);
                return List.of(single);
            }
        }
        return new ArrayList<>();
    }

    @Transactional
    public void deleteSalon(UUID id) {
        Salon salon = salonRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Salon not found with ID: " + id));
        salonRepository.delete(salon);
    }
}
