package com.saloon.Salonmgmt.security;

import com.saloon.Salonmgmt.entity.User;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Instant;
import java.util.Base64;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Component
public class JwtUtil {

    private final String secretKey;
    private final long expirationSeconds;

    public JwtUtil(
            @Value("${app.jwt.secret:salonflow-hackathon-super-secret-key-for-signing-jwt-tokens-2026!}") String secretKey,
            @Value("${app.jwt.expiration-seconds:86400}") long expirationSeconds) {
        this.secretKey = secretKey;
        this.expirationSeconds = expirationSeconds;
    }

    public String generateToken(User user) {
        try {
            String headerJson = "{\"alg\":\"HS256\",\"typ\":\"JWT\"}";
            String encodedHeader = base64UrlEncode(headerJson.getBytes(StandardCharsets.UTF_8));

            long now = Instant.now().getEpochSecond();
            long exp = now + expirationSeconds;
            String payloadJson = "{\"sub\":\"" + escape(user.getEmail()) + "\","
                    + "\"userId\":\"" + user.getId().toString() + "\","
                    + "\"name\":\"" + escape(user.getName()) + "\","
                    + "\"role\":\"" + user.getRole().name() + "\","
                    + "\"iat\":" + now + ","
                    + "\"exp\":" + exp + "}";
            String encodedPayload = base64UrlEncode(payloadJson.getBytes(StandardCharsets.UTF_8));

            String dataToSign = encodedHeader + "." + encodedPayload;
            String signature = sign(dataToSign);

            return dataToSign + "." + signature;
        } catch (Exception e) {
            throw new RuntimeException("Error generating token", e);
        }
    }

    public boolean validateToken(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return false;

            String dataToSign = parts[0] + "." + parts[1];
            String expectedSignature = sign(dataToSign);
            if (!expectedSignature.equals(parts[2])) {
                return false;
            }

            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            String payloadJson = new String(payloadBytes, StandardCharsets.UTF_8);

            Pattern expPattern = Pattern.compile("\"exp\":\\s*(\\d+)");
            Matcher matcher = expPattern.matcher(payloadJson);
            if (matcher.find()) {
                long exp = Long.parseLong(matcher.group(1));
                return Instant.now().getEpochSecond() < exp;
            }
            return false;
        } catch (Exception e) {
            return false;
        }
    }

    public String extractEmail(String token) {
        try {
            String[] parts = token.split("\\.");
            if (parts.length != 3) return null;
            byte[] payloadBytes = Base64.getUrlDecoder().decode(parts[1]);
            String payloadJson = new String(payloadBytes, StandardCharsets.UTF_8);

            Pattern subPattern = Pattern.compile("\"sub\":\\s*\"([^\"]+)\"");
            Matcher matcher = subPattern.matcher(payloadJson);
            if (matcher.find()) {
                return matcher.group(1);
            }
            return null;
        } catch (Exception e) {
            return null;
        }
    }

    private String sign(String data) throws Exception {
        Mac hmacSha256 = Mac.getInstance("HmacSHA256");
        SecretKeySpec secretKeySpec = new SecretKeySpec(secretKey.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        hmacSha256.init(secretKeySpec);
        byte[] signatureBytes = hmacSha256.doFinal(data.getBytes(StandardCharsets.UTF_8));
        return base64UrlEncode(signatureBytes);
    }

    private String base64UrlEncode(byte[] bytes) {
        return Base64.getUrlEncoder().withoutPadding().encodeToString(bytes);
    }

    private String escape(String raw) {
        if (raw == null) return "";
        return raw.replace("\\", "\\\\").replace("\"", "\\\"");
    }
}
