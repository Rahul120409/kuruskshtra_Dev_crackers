package com.saloon.Salonmgmt.service;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.util.UriComponentsBuilder;

import java.net.URI;

@Service
@Slf4j
public class WhatsAppNotificationService {

    @Value("${whatsapp.callmebot.api-key:}")
    private String apiKey;

    @Value("${whatsapp.callmebot.enabled:true}")
    private boolean enabled;

    private final RestTemplate restTemplate = new RestTemplate();

    @Async
    public void sendWhatsAppMessage(String rawPhone, String message) {
        if (!enabled) {
            log.info("[WhatsApp] Notification skipped (service disabled in configuration).");
            return;
        }

        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("demo_key")) {
            log.warn("[WhatsApp] API key not configured yet. Set whatsapp.callmebot.api-key in application.properties or WHATSAPP_API_KEY env.");
            return;
        }

        if (rawPhone == null || rawPhone.trim().isEmpty()) {
            log.warn("[WhatsApp] Cannot deliver notification: phone number is empty.");
            return;
        }

        try {
            // Clean phone number: remove +, spaces, and dashes
            String cleanPhone = rawPhone.replaceAll("[+\\s-]", "");

            URI uri = UriComponentsBuilder.fromUriString("https://api.callmebot.com/whatsapp.php")
                    .queryParam("phone", cleanPhone)
                    .queryParam("text", message)
                    .queryParam("apikey", apiKey.trim())
                    .build()
                    .toUri();

            String response = restTemplate.getForObject(uri, String.class);
            log.info("[WhatsApp] Notification sent successfully to {}: response={}", cleanPhone, response);
        } catch (Exception e) {
            log.error("[WhatsApp] Failed to deliver WhatsApp message to {}: {}", rawPhone, e.getMessage());
        }
    }

    public void sendBookingConfirmation(String phone, String customerName, int tokenNumber, int position, int waitMinutes) {
        String msg = String.format(
                "🎟️ *LuxeTrim Salon - Booking Confirmed*\n\n" +
                "Hello %s!\n" +
                "Your queue token is: *Token #%d*\n\n" +
                "🔢 Position in line: %d\n" +
                "⏳ Estimated Wait: ~%d mins\n\n" +
                "We will alert you via WhatsApp when your chair is ready! You can relax until then.",
                customerName != null ? customerName : "Guest",
                tokenNumber,
                position,
                waitMinutes
        );
        sendWhatsAppMessage(phone, msg);
    }

    public void sendChairReadyAlert(String phone, String customerName, int tokenNumber, String stylistName) {
        String msg = String.format(
                "✂️ *LuxeTrim Salon Alert*\n\nHello %s!\nYour stylist chair is *READY NOW* for *Token #%d*.\n\n👤 Stylist: %s\n📍 Please step up to the styling station immediately.\n\n_Thank you for waiting with LuxeTrim!_",
                customerName != null ? customerName : "Guest",
                tokenNumber,
                stylistName != null ? stylistName : "Your Stylist"
        );
        sendWhatsAppMessage(phone, msg);
    }

    public void sendProximityAlert(String phone, String customerName, int tokenNumber, int waitMinutes) {
        String msg = String.format(
                "⏳ *LuxeTrim Queue Notice*\n\nHi %s, you are *2 customers away* (Token #%d)!\nEstimated wait: ~%d minutes.\n\nPlease start heading to the salon lounge.",
                customerName != null ? customerName : "Guest",
                tokenNumber,
                waitMinutes
        );
        sendWhatsAppMessage(phone, msg);
    }

    public void sendCustomAlert(String phone, String message) {
        sendWhatsAppMessage(phone, message);
    }

    public String sendTestWhatsApp(String phone, String apiKeyOverride, String message) {
        String key = (apiKeyOverride != null && !apiKeyOverride.trim().isEmpty()) ? apiKeyOverride.trim() : this.apiKey;
        if (key == null || key.trim().isEmpty() || key.equals("demo_key")) {
            return "ERROR: API key is missing. Pass ?apiKey=YOUR_KEY or set whatsapp.callmebot.api-key in application.properties.";
        }
        if (phone == null || phone.trim().isEmpty()) {
            return "ERROR: Phone number is empty.";
        }
        try {
            String cleanPhone = phone.replaceAll("[+\\s-]", "");
            URI uri = UriComponentsBuilder.fromUriString("https://api.callmebot.com/whatsapp.php")
                    .queryParam("phone", cleanPhone)
                    .queryParam("text", message != null ? message : "✂️ Test notification from LuxeTrim Salon Backend!")
                    .queryParam("apikey", key.trim())
                    .build()
                    .toUri();

            log.info("[WhatsApp Test] Calling CallMeBot API for phone: {}", cleanPhone);
            String response = restTemplate.getForObject(uri, String.class);
            log.info("[WhatsApp Test] Response: {}", response);
            return response != null ? response : "Empty response from CallMeBot";
        } catch (Exception e) {
            log.error("[WhatsApp Test] Failure: {}", e.getMessage());
            return "ERROR: " + e.getMessage();
        }
    }
}

