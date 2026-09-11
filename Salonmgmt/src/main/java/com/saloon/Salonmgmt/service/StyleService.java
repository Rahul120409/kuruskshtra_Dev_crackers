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

        StyleType styleType = StyleType.builder()
                .salonId(request.getSalonId())
                .name(name)
                .code(code)
                .description(request.getDescription())
                .imageUrl(request.getImageUrl())
                .isActive(true)
                .build();

        StyleType saved = styleTypeRepository.save(styleType);
        return StyleTypeResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<StyleTypeResponse> getAllStyleTypes(UUID salonId) {
        List<StyleType> types;
        if (salonId != null) {
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
                .isActive(true)
                .build();

        SpecificStyle saved = specificStyleRepository.save(specificStyle);
        return SpecificStyleResponse.fromEntity(saved);
    }

    @Transactional(readOnly = true)
    public List<SpecificStyleResponse> getSpecificStylesByType(UUID styleTypeId) {
        return specificStyleRepository.findByStyleTypeIdOrderByNameAsc(styleTypeId)
                .stream()
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
    public List<SpecificStyleResponse> getAllSpecificStyles() {
        return specificStyleRepository.findAllWithStyleTypeOrderByNameAsc()
                .stream()
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
