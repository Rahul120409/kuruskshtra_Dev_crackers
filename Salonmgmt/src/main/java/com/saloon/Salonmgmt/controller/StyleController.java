package com.saloon.Salonmgmt.controller;

import com.saloon.Salonmgmt.dto.ApiResponse;
import com.saloon.Salonmgmt.dto.SpecificStyleRequest;
import com.saloon.Salonmgmt.dto.SpecificStyleResponse;
import com.saloon.Salonmgmt.dto.StyleTypeRequest;
import com.saloon.Salonmgmt.dto.StyleTypeResponse;
import com.saloon.Salonmgmt.service.StyleService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/styles")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class StyleController {

    private final StyleService styleService;

    // --- Style Types (e.g. Haircut, Beard, Hair Color) ---

    @PostMapping("/types")
    public ResponseEntity<ApiResponse<StyleTypeResponse>> createStyleType(@RequestBody StyleTypeRequest request) {
        try {
            StyleTypeResponse response = styleService.createStyleType(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("Style type created successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create style type: " + e.getMessage()));
        }
    }

    @GetMapping("/types")
    public ResponseEntity<ApiResponse<List<StyleTypeResponse>>> getAllStyleTypes(
            @RequestParam(required = false) UUID salonId,
            @RequestParam(required = false) String gender) {
        try {
            List<StyleTypeResponse> types = styleService.getAllStyleTypes(salonId, gender);
            return ResponseEntity.ok(ApiResponse.ok("Style types retrieved successfully", types));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve style types: " + e.getMessage()));
        }
    }

    @GetMapping("/types/{id}")
    public ResponseEntity<ApiResponse<StyleTypeResponse>> getStyleTypeById(@PathVariable String id) {
        try {
            StyleTypeResponse type = styleService.getStyleTypeByIdOrCode(id);
            return ResponseEntity.ok(ApiResponse.ok("Style type retrieved successfully", type));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve style type: " + e.getMessage()));
        }
    }

    @PutMapping("/types/{id}")
    public ResponseEntity<ApiResponse<StyleTypeResponse>> updateStyleType(
            @PathVariable UUID id,
            @RequestBody StyleTypeRequest request) {
        try {
            StyleTypeResponse response = styleService.updateStyleType(id, request);
            return ResponseEntity.ok(ApiResponse.ok("Style type updated successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update style type: " + e.getMessage()));
        }
    }

    @DeleteMapping("/types/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteStyleType(@PathVariable UUID id) {
        try {
            styleService.deleteStyleType(id);
            return ResponseEntity.ok(ApiResponse.ok("Style type deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete style type: " + e.getMessage()));
        }
    }

    // --- Specific Styles (e.g. Mullet, Taper Fade, Stubble Shape) ---

    @PostMapping("/specific")
    public ResponseEntity<ApiResponse<SpecificStyleResponse>> createSpecificStyle(@RequestBody SpecificStyleRequest request) {
        try {
            SpecificStyleResponse response = styleService.createSpecificStyle(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(ApiResponse.ok("Specific style created successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to create specific style: " + e.getMessage()));
        }
    }

    @GetMapping("/specific")
    public ResponseEntity<ApiResponse<List<SpecificStyleResponse>>> getAllSpecificStyles(
            @RequestParam(required = false) String gender) {
        try {
            List<SpecificStyleResponse> styles = styleService.getAllSpecificStyles(gender);
            return ResponseEntity.ok(ApiResponse.ok("Specific styles retrieved successfully", styles));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve specific styles: " + e.getMessage()));
        }
    }

    @GetMapping("/specific/type/{styleTypeId}")
    public ResponseEntity<ApiResponse<List<SpecificStyleResponse>>> getSpecificStylesByType(
            @PathVariable String styleTypeId,
            @RequestParam(required = false) String gender) {
        try {
            List<SpecificStyleResponse> styles = styleService.getSpecificStylesByIdentifier(styleTypeId, gender);
            return ResponseEntity.ok(ApiResponse.ok("Specific styles for type retrieved successfully", styles));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve styles for type: " + e.getMessage()));
        }
    }

    @GetMapping("/specific/type-code/{typeCode}")
    public ResponseEntity<ApiResponse<List<SpecificStyleResponse>>> getSpecificStylesByTypeCode(
            @PathVariable String typeCode) {
        try {
            List<SpecificStyleResponse> styles = styleService.getSpecificStylesByTypeCode(typeCode);
            return ResponseEntity.ok(ApiResponse.ok("Specific styles for type code retrieved successfully", styles));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve styles for type code: " + e.getMessage()));
        }
    }

    @GetMapping("/specific/{id}")
    public ResponseEntity<ApiResponse<SpecificStyleResponse>> getSpecificStyleById(@PathVariable UUID id) {
        try {
            SpecificStyleResponse style = styleService.getSpecificStyleById(id);
            return ResponseEntity.ok(ApiResponse.ok("Specific style retrieved successfully", style));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to retrieve style: " + e.getMessage()));
        }
    }

    @PutMapping("/specific/{id}")
    public ResponseEntity<ApiResponse<SpecificStyleResponse>> updateSpecificStyle(
            @PathVariable UUID id,
            @RequestBody SpecificStyleRequest request) {
        try {
            SpecificStyleResponse response = styleService.updateSpecificStyle(id, request);
            return ResponseEntity.ok(ApiResponse.ok("Specific style updated successfully", response));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to update style: " + e.getMessage()));
        }
    }

    @DeleteMapping("/specific/{id}")
    public ResponseEntity<ApiResponse<Void>> deleteSpecificStyle(@PathVariable UUID id) {
        try {
            styleService.deleteSpecificStyle(id);
            return ResponseEntity.ok(ApiResponse.ok("Specific style deleted successfully", null));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(ApiResponse.error(e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(ApiResponse.error("Failed to delete style: " + e.getMessage()));
        }
    }
}
