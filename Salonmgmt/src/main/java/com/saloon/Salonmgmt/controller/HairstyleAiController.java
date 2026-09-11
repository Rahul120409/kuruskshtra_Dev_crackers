package com.saloon.Salonmgmt.controller;

import com.saloon.Salonmgmt.model.UserHairstyleCustomization;
import com.saloon.Salonmgmt.repository.UserHairstyleCustomizationRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.*;

@RestController
@RequestMapping("/api/ai")
@CrossOrigin(origins = "*")
public class HairstyleAiController {

    private final UserHairstyleCustomizationRepository customizationRepository;

    public HairstyleAiController(UserHairstyleCustomizationRepository customizationRepository) {
        this.customizationRepository = customizationRepository;
    }

    // ==========================================
    // 1. GET /api/ai/catalog
    // ==========================================
    @GetMapping("/catalog")
    public ResponseEntity<Map<String, Object>> getCatalog(
            @RequestParam(required = false) String gender,
            @RequestParam(required = false) String category) {

        List<Map<String, Object>> styles = new ArrayList<>();

        // Boys' Catalog
        styles.add(createStyleItem("HS-B01", "Textured Crop", "boy", "Fade", "A contemporary short cut with textured forward fringe and clean skin fade on the sides.", "/looks/boy_crop.jpg", List.of("Oval", "Round", "Heart"), 95));
        styles.add(createStyleItem("HS-B02", "Quiff", "boy", "Modern", "Front hair brushed upward and back for vertical volume with neatly tapered sides.", "/looks/boy_quiff.jpg", List.of("Round", "Square", "Oval"), 89));
        styles.add(createStyleItem("HS-B03", "Pompadour", "boy", "Classic", "Classic high volume swept up and back in a wave with tapered temple contours.", "/looks/boy_pompadour.jpg", List.of("Oval", "Round", "Square"), 86));
        styles.add(createStyleItem("HS-B04", "Buzz Cut", "boy", "Fade", "Sharp, ultra-low maintenance military clipper cut with high skin fade.", "/looks/boy_buzz.jpg", List.of("Square", "Oval", "Diamond"), 83));
        styles.add(createStyleItem("HS-B05", "Side Part", "boy", "Classic", "Refined executive taper with clean side part parting.", "/looks/boy_side_part.jpg", List.of("Round", "Oval", "Square"), 81));

        // Girls' Catalog
        styles.add(createStyleItem("HS-G01", "Butterfly Cut", "girl", "Layered", "Cascading long layers framing the face with wing-like feathered movement and volume.", "/looks/girl_butterfly.jpg", List.of("Oval", "Heart", "Square"), 95));
        styles.add(createStyleItem("HS-G02", "Curtain Bob", "girl", "Medium", "Chic chin-grazing bob featuring soft center-parted curtain bangs framing cheekbones.", "/looks/girl_curtain_bob.jpg", List.of("Oval", "Round", "Diamond"), 89));
        styles.add(createStyleItem("HS-G03", "Wolf Cut", "girl", "Modern", "Dynamic choppy crown layers with wispy face-framing fringe tapering to soft lengths.", "/looks/girl_butterfly.jpg", List.of("Oval", "Heart", "Square"), 86));
        styles.add(createStyleItem("HS-G04", "Pixie Cut", "girl", "Short", "Ultra-chic short crop with delicate wispy front fringe and clean tapered neckline.", "/looks/girl_pixie.jpg", List.of("Oval", "Heart", "Diamond"), 83));

        List<Map<String, Object>> filtered = new ArrayList<>();
        for (Map<String, Object> s : styles) {
            if (gender != null && !gender.isEmpty() && !s.get("targetGender").equals(gender)) {
                continue;
            }
            if (category != null && !category.isEmpty() && !s.get("category").equals(category)) {
                continue;
            }
            filtered.add(s);
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("total", filtered.size());
        response.put("hairstyles", filtered);
        response.put("source", "Spring Boot Backend (Salonmgmt)");

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 2. POST /api/ai/analyze-hairstyle
    // ==========================================
    @PostMapping("/analyze-hairstyle")
    public ResponseEntity<Map<String, Object>> analyzeHairstyle(@RequestBody(required = false) Map<String, Object> payload) {
        String gender = payload != null && payload.get("gender") != null ? payload.get("gender").toString() : "girl";
        String faceShape = payload != null && payload.get("faceShape") != null ? payload.get("faceShape").toString() : "Oval";
        String hairType = payload != null && payload.get("hairType") != null ? payload.get("hairType").toString() : "Wavy";
        String hairDensity = payload != null && payload.get("hairDensity") != null ? payload.get("hairDensity").toString() : "Medium";

        List<Map<String, Object>> recommendations = new ArrayList<>();
        if ("boy".equalsIgnoreCase(gender)) {
            recommendations.add(createRecItem("HS-B01", "Textured Crop", 95, "Complements your " + faceShape + " shape and " + hairType + " texture."));
            recommendations.add(createRecItem("HS-B02", "Quiff", 89, "Provides vertical balance for " + faceShape + " contours."));
            recommendations.add(createRecItem("HS-B03", "Pompadour", 86, "Classic structured volume suited for " + hairDensity + " density."));
        } else {
            recommendations.add(createRecItem("HS-G01", "Butterfly Cut", 95, "Cascading face-framing movement ideal for " + faceShape + " face structures."));
            recommendations.add(createRecItem("HS-G02", "Curtain Bob", 89, "Soft cheekbone framing accentuating " + hairType + " texture."));
            recommendations.add(createRecItem("HS-G03", "Wolf Cut", 86, "Modern crown texture tailored for " + hairDensity + " density."));
        }

        Map<String, Object> response = new HashMap<>();
        response.put("detectedGender", gender);
        response.put("faceShape", faceShape);
        response.put("hairType", hairType);
        response.put("hairDensity", hairDensity);
        response.put("recommendations", recommendations);
        response.put("analyzedAt", Instant.now().toString());
        response.put("source", "Spring Boot Backend (Salonmgmt)");

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 3. POST /api/ai/preview-hairstyle
    // ==========================================
    @PostMapping("/preview-hairstyle")
    public ResponseEntity<Map<String, Object>> previewHairstyle(@RequestBody(required = false) Map<String, Object> payload) {
        String styleId = payload != null && payload.get("hairstyleId") != null ? payload.get("hairstyleId").toString() : "HS-B01";
        String color = payload != null && payload.get("hairColor") != null ? payload.get("hairColor").toString() : "Natural";

        String previewUrl = styleId.startsWith("HS-G") ? "/looks/girl_butterfly.jpg" : "/looks/boy_crop.jpg";
        if (styleId.equals("HS-G02")) previewUrl = "/looks/girl_curtain_bob.jpg";
        if (styleId.equals("HS-G04")) previewUrl = "/looks/girl_pixie.jpg";
        if (styleId.equals("HS-B02")) previewUrl = "/looks/boy_quiff.jpg";
        if (styleId.equals("HS-B03")) previewUrl = "/looks/boy_pompadour.jpg";
        if (styleId.equals("HS-B04")) previewUrl = "/looks/boy_buzz.jpg";
        if (styleId.equals("HS-B05")) previewUrl = "/looks/boy_side_part.jpg";

        Map<String, Object> response = new HashMap<>();
        response.put("hairstyleId", styleId);
        response.put("hairColor", color);
        response.put("previewImageUrl", previewUrl);
        response.put("status", "SUCCESS");
        response.put("source", "Spring Boot Backend (Salonmgmt)");

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 4. POST /api/ai/generate-user-look
    // ==========================================
    @PostMapping("/generate-user-look")
    public ResponseEntity<Map<String, Object>> generateUserLook(@RequestBody(required = false) Map<String, Object> payload) {
        String styleId = payload != null && payload.get("hairstyleId") != null ? payload.get("hairstyleId").toString() : "HS-B01";
        String userImage = payload != null && payload.get("userImageUrl") != null ? payload.get("userImageUrl").toString() : "/looks/girl_original.jpg";

        Map<String, Object> response = new HashMap<>();
        response.put("originalImageUrl", userImage);
        response.put("generatedLookImageUrl", styleId.startsWith("HS-G") ? "/looks/girl_butterfly.jpg" : "/looks/boy_crop.jpg");
        response.put("hairstyleId", styleId);
        response.put("status", "SUCCESS");
        response.put("source", "Spring Boot Backend (Salonmgmt)");

        return ResponseEntity.ok(response);
    }

    // ==========================================
    // 5. POST & GET /api/ai/process-customization
    // ==========================================
    @PostMapping("/process-customization")
    public ResponseEntity<Map<String, Object>> processCustomization(@RequestBody(required = false) Map<String, Object> payload) {
        String styleId = payload != null && payload.get("hairstyleId") != null ? payload.get("hairstyleId").toString() : "HS-G01";
        String gender = payload != null && payload.get("gender") != null ? payload.get("gender").toString() : "girl";
        String color = payload != null && payload.get("hairColor") != null ? payload.get("hairColor").toString() : "Natural";
        String userImage = payload != null && payload.get("userImage") != null ? payload.get("userImage").toString() : "";

        String lookUrl = styleId.startsWith("HS-G") ? "/looks/girl_butterfly.jpg" : "/looks/boy_crop.jpg";
        if (styleId.equals("HS-G02")) lookUrl = "/looks/girl_curtain_bob.jpg";
        if (styleId.equals("HS-G04")) lookUrl = "/looks/girl_pixie.jpg";
        if (styleId.equals("HS-B02")) lookUrl = "/looks/boy_quiff.jpg";
        if (styleId.equals("HS-B03")) lookUrl = "/looks/boy_pompadour.jpg";
        if (styleId.equals("HS-B04")) lookUrl = "/looks/boy_buzz.jpg";
        if (styleId.equals("HS-B05")) lookUrl = "/looks/boy_side_part.jpg";

        Long savedId = 1L;
        try {
            UserHairstyleCustomization record = UserHairstyleCustomization.builder()
                    .sessionId("session_" + System.currentTimeMillis())
                    .gender(gender)
                    .faceShape(payload != null && payload.get("faceShape") != null ? payload.get("faceShape").toString() : "Oval")
                    .hairType(payload != null && payload.get("hairType") != null ? payload.get("hairType").toString() : "Wavy")
                    .hairDensity(payload != null && payload.get("hairDensity") != null ? payload.get("hairDensity").toString() : "Medium")
                    .hairstyleId(styleId)
                    .hairstyleName(getStyleName(styleId))
                    .hairColor(color)
                    .hairTop(0)
                    .hairScale(100)
                    .matchScore(95)
                    .originalImage(userImage.length() > 300 ? userImage.substring(0, 300) + "..." : userImage)
                    .customizedImage(lookUrl)
                    .processingTimeMs(45)
                    .build();

            UserHairstyleCustomization saved = customizationRepository.save(record);
            savedId = saved.getId();
        } catch (Exception e) {
            System.err.println("[Spring Boot] Warning saving to Supabase PostgreSQL: " + e.getMessage());
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("dbRecordId", savedId);
        response.put("customizedImageUrl", lookUrl);
        response.put("hairstyleId", styleId);
        response.put("hairstyleName", getStyleName(styleId));
        response.put("hairColor", color);
        response.put("database", "Supabase PostgreSQL (via Spring Boot Salonmgmt)");
        response.put("processingTimeMs", 45);

        return ResponseEntity.ok(response);
    }

    @GetMapping("/process-customization")
    public ResponseEntity<Map<String, Object>> getCustomizationHistory() {
        List<UserHairstyleCustomization> history;
        try {
            history = customizationRepository.findTop8ByOrderByCreatedAtDesc();
        } catch (Exception e) {
            history = Collections.emptyList();
        }

        Map<String, Object> response = new HashMap<>();
        response.put("success", true);
        response.put("history", history);
        response.put("count", history.size());
        response.put("database", "Supabase PostgreSQL (via Spring Boot Salonmgmt)");

        return ResponseEntity.ok(response);
    }

    // Helper methods
    private Map<String, Object> createStyleItem(String id, String name, String gender, String category, String desc, String img, List<String> faceShapes, int match) {
        Map<String, Object> m = new HashMap<>();
        m.put("id", id);
        m.put("name", name);
        m.put("targetGender", gender);
        m.put("category", category);
        m.put("description", desc);
        m.put("imageUrl", img);
        m.put("suitableFaceShapes", faceShapes);
        m.put("matchScore", match);
        return m;
    }

    private Map<String, Object> createRecItem(String id, String name, int match, String reason) {
        Map<String, Object> m = new HashMap<>();
        m.put("hairstyleId", id);
        m.put("name", name);
        m.put("matchScore", match);
        m.put("reason", reason);
        return m;
    }

    private String getStyleName(String id) {
        if ("HS-G01".equals(id)) return "Butterfly Cut";
        if ("HS-G02".equals(id)) return "Curtain Bob";
        if ("HS-G03".equals(id)) return "Wolf Cut";
        if ("HS-G04".equals(id)) return "Pixie Cut";
        if ("HS-B01".equals(id)) return "Textured Crop";
        if ("HS-B02".equals(id)) return "Quiff";
        if ("HS-B03".equals(id)) return "Pompadour";
        if ("HS-B04".equals(id)) return "Buzz Cut";
        if ("HS-B05".equals(id)) return "Side Part";
        return "Custom Haircut";
    }
}
