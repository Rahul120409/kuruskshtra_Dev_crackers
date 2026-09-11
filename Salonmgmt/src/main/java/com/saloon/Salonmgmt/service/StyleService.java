package com.saloon.Salonmgmt.service;

import com.saloon.Salonmgmt.dto.SpecificStyleRequest;
import com.saloon.Salonmgmt.dto.SpecificStyleResponse;
import com.saloon.Salonmgmt.dto.StyleTypeRequest;
import com.saloon.Salonmgmt.dto.StyleTypeResponse;
import com.saloon.Salonmgmt.entity.SpecificStyle;
import com.saloon.Salonmgmt.entity.StyleType;
import com.saloon.Salonmgmt.repository.SpecificStyleRepository;
import com.saloon.Salonmgmt.repository.StyleTypeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StyleService {

    private final StyleTypeRepository styleTypeRepository;
    private final SpecificStyleRepository specificStyleRepository;

    // --- Style Type Logic ---

    @Transactional
    public StyleTypeResponse createStyleType(StyleTypeRequest request) {
        String name = request.getEffectiveName();
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("Style type name is required (e.g., Haircut, Beard)");
        }

        String code = request.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = name.trim().toUpperCase().replace(" ", "_");
        } else {
            code = code.trim().toUpperCase();
        }

        String gender = (request.getGender() != null && !request.getGender().trim().isEmpty())
                ? request.getGender().trim().toUpperCase() : "UNISEX";

        StyleType styleType = StyleType.builder()
                .salonId(request.getSalonId())
                .name(name)
                .code(code)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .gender(gender)
                .isActive(true)
                .build();

        StyleType saved = styleTypeRepository.save(styleType);
        return StyleTypeResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<StyleTypeResponse> getAllStyleTypes(UUID salonId, String gender) {
        List<StyleType> types;
        if (gender != null && !gender.trim().isEmpty()) {
            types = styleTypeRepository.findByGenderOrderByNameAsc(gender.trim().toUpperCase());
        } else if (salonId != null) {
            types = styleTypeRepository.findBySalonIdOrderByNameAsc(salonId);
        } else {
            types = styleTypeRepository.findAllByOrderByNameAsc();
        }
        return types.stream()
                .map(StyleTypeResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public StyleTypeResponse getStyleTypeById(UUID id) {
        StyleType type = styleTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Style type not found with ID: " + id));
        return StyleTypeResponse.fromEntity(type);
    }

    @Transactional(readOnly = true)
    public StyleTypeResponse getStyleTypeByIdOrCode(String identifier) {
        if (identifier == null || identifier.trim().isEmpty()) {
            throw new IllegalArgumentException("Style type identifier cannot be empty");
        }
        try {
            UUID uuid = UUID.fromString(identifier.trim());
            return getStyleTypeById(uuid);
        } catch (IllegalArgumentException e) {
            return styleTypeRepository.findByCodeIgnoreCase(identifier.trim())
                    .or(() -> styleTypeRepository.findByNameIgnoreCase(identifier.trim()))
                    .map(StyleTypeResponse::fromEntity)
                    .orElseThrow(() -> new IllegalArgumentException("Style type not found with code or identifier: " + identifier));
        }
    }

    @Transactional
    public StyleTypeResponse updateStyleType(UUID id, StyleTypeRequest request) {
        StyleType type = styleTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Style type not found with ID: " + id));

        if (request.getEffectiveName() != null && !request.getEffectiveName().isEmpty()) {
            type.setName(request.getEffectiveName());
        }
        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            type.setCode(request.getCode().trim().toUpperCase());
        }
        if (request.getDescription() != null) {
            type.setDescription(request.getDescription().trim());
        }
        if (request.getImageUrl() != null) {
            type.setImageUrl(request.getImageUrl().trim());
        }
        if (request.getGender() != null && !request.getGender().trim().isEmpty()) {
            type.setGender(request.getGender().trim().toUpperCase());
        }
        if (request.getIsActive() != null) {
            type.setActive(request.getIsActive());
        }

        StyleType updated = styleTypeRepository.save(type);
        return StyleTypeResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteStyleType(UUID id) {
        StyleType type = styleTypeRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Style type not found with ID: " + id));
        styleTypeRepository.delete(type);
    }

    // --- Specific Style Logic ---

    @Transactional
    public SpecificStyleResponse createSpecificStyle(SpecificStyleRequest request) {
        String name = request.getEffectiveName();
        if (name == null || name.isEmpty()) {
            throw new IllegalArgumentException("Specific style name is required (e.g., Mullet, Taper Fade)");
        }

        StyleType styleType;
        if (request.getStyleTypeId() != null) {
            styleType = styleTypeRepository.findById(request.getStyleTypeId())
                    .orElseThrow(() -> new IllegalArgumentException("Style type not found with ID: " + request.getStyleTypeId()));
        } else if (request.getStyleTypeCode() != null && !request.getStyleTypeCode().trim().isEmpty()) {
            styleType = styleTypeRepository.findByCodeIgnoreCase(request.getStyleTypeCode().trim())
                    .orElseThrow(() -> new IllegalArgumentException("Style type not found with code: " + request.getStyleTypeCode()));
        } else {
            throw new IllegalArgumentException("Style type (styleTypeId or styleTypeCode) is required");
        }

        String code = request.getCode();
        if (code == null || code.trim().isEmpty()) {
            code = name.trim().toUpperCase().replace(" ", "_");
        } else {
            code = code.trim().toUpperCase();
        }

        String gender = (request.getGender() != null && !request.getGender().trim().isEmpty())
                ? request.getGender().trim().toUpperCase()
                : (styleType.getGender() != null ? styleType.getGender() : "UNISEX");

        SpecificStyle specificStyle = SpecificStyle.builder()
                .styleType(styleType)
                .name(name)
                .code(code)
                .description(request.getDescription())
                .price(request.getPrice())
                .durationMinutes(request.getDurationMinutes() != null ? request.getDurationMinutes() : 30)
                .imageUrl(request.getImageUrl())
                .suitableFaceShapes(request.getSuitableFaceShapes())
                .suitableHairTypes(request.getSuitableHairTypes())
                .gender(gender)
                .isActive(true)
                .build();

        SpecificStyle saved = specificStyleRepository.save(specificStyle);
        return SpecificStyleResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<SpecificStyleResponse> getSpecificStylesByType(UUID styleTypeId, String gender) {
        List<SpecificStyle> styles;
        if (gender != null && !gender.trim().isEmpty()) {
            styles = specificStyleRepository.findByStyleTypeIdAndGenderOrderByNameAsc(styleTypeId, gender.trim().toUpperCase());
        } else {
            styles = specificStyleRepository.findByStyleTypeIdOrderByNameAsc(styleTypeId);
        }
        return styles.stream()
                .map(SpecificStyleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SpecificStyleResponse> getSpecificStylesByTypeCode(String typeCode) {
        return specificStyleRepository.findByStyleTypeCodeOrderByNameAsc(typeCode)
                .stream()
                .map(SpecificStyleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<SpecificStyleResponse> getSpecificStylesByIdentifier(String identifier, String gender) {
        if (identifier == null || identifier.trim().isEmpty()) {
            return java.util.Collections.emptyList();
        }
        try {
            UUID uuid = UUID.fromString(identifier.trim());
            return getSpecificStylesByType(uuid, gender);
        } catch (IllegalArgumentException e) {
            String codeOrName = identifier.trim();
            java.util.Optional<StyleType> styleTypeOpt = styleTypeRepository.findByCodeIgnoreCase(codeOrName);
            if (!styleTypeOpt.isPresent()) {
                styleTypeOpt = styleTypeRepository.findByNameIgnoreCase(codeOrName);
            }
            if (styleTypeOpt.isPresent()) {
                return getSpecificStylesByType(styleTypeOpt.get().getId(), gender);
            }

            List<SpecificStyleResponse> byCode = getSpecificStylesByTypeCode(codeOrName);
            if (!byCode.isEmpty()) {
                return byCode;
            }

            return java.util.Collections.emptyList();
        }
    }

    @Transactional(readOnly = true)
    public List<SpecificStyleResponse> getAllSpecificStyles(String gender) {
        List<SpecificStyle> styles;
        if (gender != null && !gender.trim().isEmpty()) {
            styles = specificStyleRepository.findByGenderOrderByNameAsc(gender.trim().toUpperCase());
        } else {
            styles = specificStyleRepository.findAllWithStyleTypeOrderByNameAsc();
        }
        return styles.stream()
                .map(SpecificStyleResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public SpecificStyleResponse getSpecificStyleById(UUID id) {
        SpecificStyle style = specificStyleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Specific style not found with ID: " + id));
        return SpecificStyleResponse.fromEntity(style);
    }

    @Transactional
    public SpecificStyleResponse updateSpecificStyle(UUID id, SpecificStyleRequest request) {
        SpecificStyle style = specificStyleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Specific style not found with ID: " + id));

        if (request.getEffectiveName() != null && !request.getEffectiveName().isEmpty()) {
            style.setName(request.getEffectiveName());
        }
        if (request.getCode() != null && !request.getCode().trim().isEmpty()) {
            style.setCode(request.getCode().trim().toUpperCase());
        }
        if (request.getDescription() != null) {
            style.setDescription(request.getDescription());
        }
        if (request.getPrice() != null) {
            style.setPrice(request.getPrice());
        }
        if (request.getDurationMinutes() != null) {
            style.setDurationMinutes(request.getDurationMinutes());
        }
        if (request.getImageUrl() != null) {
            style.setImageUrl(request.getImageUrl());
        }
        if (request.getSuitableFaceShapes() != null) {
            style.setSuitableFaceShapes(request.getSuitableFaceShapes());
        }
        if (request.getSuitableHairTypes() != null) {
            style.setSuitableHairTypes(request.getSuitableHairTypes());
        }
        if (request.getGender() != null && !request.getGender().trim().isEmpty()) {
            style.setGender(request.getGender().trim().toUpperCase());
        }

        SpecificStyle updated = specificStyleRepository.save(style);
        return SpecificStyleResponse.fromEntity(updated);
    }

    @Transactional
    public void deleteSpecificStyle(UUID id) {
        SpecificStyle style = specificStyleRepository.findById(id)
                .orElseThrow(() -> new IllegalArgumentException("Specific style not found with ID: " + id));
        specificStyleRepository.delete(style);
    }
}
